import { JobRecommendation, UserProfile, ApiResponse } from "../types/types";

const API_BASE_URL = 'http://localhost:8000/api';

export const submitProfile = async (profile: UserProfile): Promise<ApiResponse> => {
  try {
    const formData = new FormData();

    // Append CV file if it exists
    if (profile.cv) {
      formData.append('file', profile.cv);
      console.log(formData);
    }

    // Append skills as a JSON array instead of comma-separated string
    formData.append('skills', JSON.stringify(profile.skills));

    // Format experiences as simple strings in the format expected by the backend
    // Example: "Software Engineer at ABC 2020-2022"
    const formattedExperiences = profile.experiences.map(exp => {
      let expString = `${exp.jobTitle} at ${exp.company}`;
      if (exp.startDate && exp.endDate) {
        expString += ` ${exp.startDate}-${exp.endDate}`;
      }
      return expString;
    });
    formData.append('experience', JSON.stringify(formattedExperiences));

    // Format education as simple strings in the format expected by the backend
    // Example: "Bachelor in Computer Science"
    const formattedEducation = profile.education.map(edu => {
      let eduString = `${edu.degree} at ${edu.institution}`;
      if (edu.graduationDate) {
        eduString += ` (${edu.graduationDate})`;
      }
      return eduString;
    });
    formData.append('education', JSON.stringify(formattedEducation));

    // Add location if available
    if (profile.location) {
      formData.append('location', profile.location);
    }

    const response = await fetch(`${API_BASE_URL}/upload-cv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to submit profile');
    }

    // Parse the response
    const responseData = await response.json();
    
    // Transform the response to match our expected ApiResponse format
    return {
      message: responseData.message,
      url: responseData.url,
      user_id: responseData.user_id,
      resume_id: responseData.resume_id,
      job_recommendations: responseData.recommendations?.items || []
    };
  } catch (error) {
    console.error('Error submitting profile:', error);
    throw error;
  }
};
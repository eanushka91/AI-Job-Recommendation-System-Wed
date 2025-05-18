import { UserProfile, ApiResponse, PaginatedJobRecommendations, LoadMoreApiResponse } from "../types/types"; // Removed JobRecommendation

const API_BASE_URL = 'http://localhost:8000/api';

export const submitProfile = async (profile: UserProfile): Promise<ApiResponse> => {
  try {
    const formData = new FormData();

    if (profile.cv) {
      formData.append('file', profile.cv);
    }
    formData.append('skills', JSON.stringify(profile.skills));
    const formattedExperiences = profile.experiences.map(exp => {
      let expString = `${exp.jobTitle} at ${exp.company}`;
      if (exp.startDate && exp.endDate) {
        expString += ` ${exp.startDate}-${exp.endDate}`;
      }
      return expString;
    });
    formData.append('experience', JSON.stringify(formattedExperiences));
    const formattedEducation = profile.education.map(edu => {
      let eduString = `${edu.degree} at ${edu.institution}`;
      if (edu.graduationDate) {
        eduString += ` (${edu.graduationDate})`;
      }
      return eduString;
    });
    formData.append('education', JSON.stringify(formattedEducation));
    if (profile.location) {
      formData.append('location', profile.location);
    }

    const response = await fetch(`${API_BASE_URL}/upload-cv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to submit profile' }));
      throw new Error(errorData.message || 'Failed to submit profile');
    }

    const responseData = await response.json();

    // Assuming responseData.recommendations is the PaginatedJobRecommendations object from the backend
    return {
      message: responseData.message,
      url: responseData.url,
      user_id: responseData.user_id,
      resume_id: responseData.resume_id,
      job_recommendations_initial: responseData.recommendations || { items: [], total: 0, page: 1, size: 10, pages: 0, has_next: false, has_prev: false }
    };
  } catch (error) {
    console.error('Error submitting profile:', error);
    throw error;
  }
};

export const loadMoreRecommendations = async (
  resumeId: number,
  location: string | undefined,
  page: number,
  size: number = 10 // Default page size
): Promise<PaginatedJobRecommendations> => {
  try {
    const queryParams = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (location) {
        queryParams.append('location', location);
    }

    const response = await fetch(`${API_BASE_URL}/recommendations/${resumeId}?${queryParams.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to load more recommendations' }));
      throw new Error(errorData.message || 'Failed to load more recommendations');
    }

    const responseData: LoadMoreApiResponse = await response.json();
    // The backend /api/recommendations/{resume_id} returns a structure containing a 'recommendations' field
    // which is the PaginatedJobRecommendations object.
    return responseData.recommendations || { items: [], total: 0, page: page, size: size, pages: 0, has_next: false, has_prev: false };

  } catch (error) {
    console.error('Error loading more recommendations:', error);
    throw error;
  }
};
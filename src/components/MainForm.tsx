// MainForm.tsx

import React, { useState } from 'react';
import CVUploadPage from './CVUploadPage'; // Assume paths are correct
import SkillsPage from './SkillsPage';
import ExperiencePage from './ExperiencePage';
import RecommendationPage from './RecommendationPage';
import { UserProfile, ApiResponse as SubmitApiResponse, Experience, Education } from '../types/types'; // Ensure types are correctly imported
import { submitProfile } from '../api/Api'; // Assume path is correct
import { CheckIcon } from 'lucide-react'; // Assuming lucide-react is installed

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
    return (
      <div className="py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center w-1/4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${index <= currentStep ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
                {index < currentStep ? <CheckIcon className="w-5 h-5" /> : <span>{index + 1}</span>}
              </div>
              <span className={`mt-2 text-xs md:text-sm break-words ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded"></div>
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 rounded transition-all duration-300"
            style={{
              width: steps.length > 1 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%'
            }}
          ></div>
        </div>
      </div>
    );
  };


const MainForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [profile, setProfile] = useState<UserProfile>({
    skills: [],
    experiences: [], // This will be an empty array if user selects "No" for experience
    education: [],
    location: '', // Initialize location
    // cv: undefined, // Optional: if you need to store it in profile state, though it's usually handled directly for upload
  });
  const [submitApiResponse, setSubmitApiResponse] = useState<SubmitApiResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For API submission loading

  const steps = ["Upload CV", "Add Skills & Location", "Add Experience & Education", "Job Recommendations"];

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleCVUpload = (file: File) => {
    updateProfile({ cv: file });
    nextStep();
  };

  const handleSkillsSubmit = (skills: string[], location: string) => {
    updateProfile({ skills, location });
    nextStep();
  };

  // This function is now async to handle the API call and loading state
  const handleExperienceSubmit = async (experiences: Experience[], education: Education[]) => {
    const updatedProfile = { ...profile, experiences, education };
    setProfile(updatedProfile); // Update profile state with the latest experiences and education

    setIsLoading(true); // Start loading
    nextStep();         // Move to the recommendations/loading view (step 3)

    try {
      const response = await submitProfile(updatedProfile); // Use the most recent profile data
      setSubmitApiResponse(response);
      // Update profile with user_id and resume_id from response for completeness
      setProfile(prev => ({ ...prev, user_id: response.user_id, resume_id: response.resume_id }));
    } catch (error) {
      console.error('Error submitting profile data:', error);
      alert('Failed to get job recommendations. Please check your input or try again later.');
      setSubmitApiResponse(undefined); // Clear response on error so Rec page knows something went wrong
      // Optionally, you could call prevStep() here to go back to the form if the API fails
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const displayStep = currentStep;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-20 py-8">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-blue-600">Career Compass</h1>
          <p className="text-gray-600">Find the perfect job match based on your profile</p>
        </header>

        <div className="mb-8">
          <ProgressBar steps={steps} currentStep={currentStep} />
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          {displayStep === 0 && (
            <CVUploadPage onUpload={handleCVUpload} />
          )}

          {displayStep === 1 && (
            <SkillsPage
              initialSkills={profile.skills}
              initialLocation={profile.location}
              onSubmit={handleSkillsSubmit}
              onBack={prevStep}
            />
          )}

          {displayStep === 2 && (
            <ExperiencePage
              initialExperiences={profile.experiences}
              initialEducation={profile.education}
              onSubmit={handleExperienceSubmit} // This is now an async handler
              onBack={prevStep}
            />
          )}

          {/* Step 3: Loading state or RecommendationPage or Error state */}
          {displayStep === 3 && isLoading && (
            // This is the loading spinner shown while API call is in progress
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-600">Generating recommendations...</p>
              <p className="text-sm text-gray-500 mt-2">This might take a moment, please wait.</p>
            </div>
          )}

          {displayStep === 3 && !isLoading && submitApiResponse && (
            // Show RecommendationPage if loading is done and API response is successful
            <RecommendationPage
              initialApiResponse={submitApiResponse}
              isLoadingInitially={false} // MainForm handles the primary loading indicator
              resumeId={submitApiResponse.resume_id}
              initialLocation={profile.location}
            />
          )}

          {displayStep === 3 && !isLoading && !submitApiResponse && (
            // Show if loading is done but there's no API response (e.g., API call failed)
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-red-700 mb-2">Oops! Something went wrong.</h3>
              <p className="text-gray-600 mb-4">We couldn't fetch your job recommendations. Please try submitting again.</p>
              <button
                type="button"
                onClick={prevStep} // Go back to the Experience/Education page
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainForm;
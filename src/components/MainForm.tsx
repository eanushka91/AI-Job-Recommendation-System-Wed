import React, { useState } from 'react';
import CVUploadPage from './CVUploadPage';
import SkillsPage from './SkillsPage';
import ExperiencePage from './ExperiencePage';
import RecommendationPage from './RecommendationPage';
import { UserProfile, ApiResponse } from '../types/types';
import { submitProfile } from '../api/Api';
import { CheckIcon } from 'lucide-react';

// Progress Bar Component
interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep
}) => {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${index <= currentStep ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
              {index < currentStep ? <CheckIcon className="w-5 h-5" /> : <span>{index + 1}</span>}
            </div>
            <span className={`mt-2 text-sm ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300" 
          style={{
            width: `${currentStep / (steps.length - 1) * 100}%`
          }}
        ></div>
      </div>
    </div>
  );
};

const MainForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0); // Changed to 0-based index for the ProgressBar
  const [profile, setProfile] = useState<UserProfile>({
    skills: [],
    experiences: [],
    education: [],
  });
  const [apiResponse, setApiResponse] = useState<ApiResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Define steps for the progress bar
  const steps = ["Upload CV", "Add Skills", "Add Experience", "Recommendations"];
  
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };
  
  const handleCVUpload = (file: File) => {
    updateProfile({ cv: file });
    nextStep();
  };
  
  const handleSkillsSubmit = (skills: string[], location: string) => {
    updateProfile({ skills, location });
    nextStep();
  };
  
  const handleExperienceSubmit = (experiences: any[], education: any[]) => {
    updateProfile({ experiences, education });
    submitProfileData();
  };
  
  const submitProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await submitProfile(profile);
      console.log("API Response:", response);
      setApiResponse(response);
      nextStep();
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get job recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1)); // Changed to ensure we don't go below 0
  };
  
  // Map the 0-based index to 1-based for the original component logic
  const displayStep = currentStep + 1;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-20 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Career Compass</h1>
          <p className="text-gray-600">Find the perfect job match based on your profile</p>
        </header>
        
        <div className="mb-8">
          {/* Replace the old progress indicator with the new ProgressBar component */}
          <ProgressBar steps={steps} currentStep={currentStep} />
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            {displayStep === 1 && (
              <CVUploadPage onUpload={handleCVUpload} />
            )}
            
            {displayStep === 2 && (
              <SkillsPage 
                initialSkills={profile.skills}
                initialLocation={profile.location}
                onSubmit={handleSkillsSubmit} 
                onBack={prevStep} 
              />
            )}
            
            {displayStep === 3 && (
              <ExperiencePage 
                onSubmit={handleExperienceSubmit} 
                onBack={prevStep} 
              />
            )}
            
            {displayStep === 4 && (
              <RecommendationPage 
                apiResponse={apiResponse} 
                isLoading={isLoading} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainForm;
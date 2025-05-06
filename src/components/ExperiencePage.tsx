import React, { useState } from 'react';
import { Experience, Education } from '../types/types';

interface ExperiencePageProps {
  onSubmit: (experiences: Experience[], education: Education[]) => void;
  onBack: () => void;
}

const initialExperience: Experience = {
  jobTitle: '',
  company: '',
};

const initialEducation: Education = {
  degree: '',
  institution: '',
};

const ExperiencePage: React.FC<ExperiencePageProps> = ({ onSubmit, onBack }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean | null>(null);
  
  const [currentExperience, setCurrentExperience] = useState<Experience>(initialExperience);
  const [currentEducation, setCurrentEducation] = useState<Education>(initialEducation);
  
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentExperience(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEducation(prev => ({ ...prev, [name]: value }));
  };
  
  const addExperience = () => {
    if (currentExperience.jobTitle && currentExperience.company) {
      setExperiences([...experiences, currentExperience]);
      setCurrentExperience(initialExperience);
    }
  };
  
  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institution) {
      setEducation([...education, currentEducation]);
      setCurrentEducation(initialEducation);
    }
  };
  
  const handleSubmit = () => {
    if (education.length > 0) {
      // Make sure all experiences have the required fields
      const formattedExperiences = experiences.map(exp => ({
        jobTitle: exp.jobTitle,
        company: exp.company,
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        description: exp.description || ''
      }));
      
      // Make sure all education entries have the required fields
      const formattedEducation = education.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        graduationDate: edu.graduationDate || ''
      }));
      
      onSubmit(formattedExperiences, formattedEducation);
    }
  };

  const removeEducation = (index: number) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    setEducation(updatedEducation);
  };

  const removeExperience = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Add Experience</h2>
      
      {/* Education Section */}
      <div className="mb-8">
        <h3 className="text-xl font-medium mb-4">Education Details</h3>
        <p className="text-gray-600 mb-4">Please provide your educational background (mandatory)</p>
        
        {education.map((edu, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md mb-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{edu.degree}</p>
              <p className="text-gray-600">{edu.institution}</p>
              {edu.graduationDate && <p className="text-gray-500 text-sm">Graduation: {edu.graduationDate}</p>}
            </div>
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        
        <div className="bg-white p-4 border border-gray-200 rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree/Qualification
              </label>
              <input
                type="text"
                name="degree"
                value={currentEducation.degree}
                onChange={handleEducationChange}
                placeholder="Bachelor of Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution
              </label>
              <input
                type="text"
                name="institution"
                value={currentEducation.institution}
                onChange={handleEducationChange}
                placeholder="University Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Date (Optional)
              </label>
              <input
                type="text"
                name="graduationDate"
                value={currentEducation.graduationDate || ''}
                onChange={handleEducationChange}
                placeholder="MM/YYYY"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={addEducation}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                currentEducation.degree && currentEducation.institution
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!currentEducation.degree || !currentEducation.institution}
            >
              Add Education
            </button>
          </div>
        </div>
      </div>
      
      {/* Work Experience Section */}
      <div className="mb-8">
        <h3 className="text-xl font-medium mb-4">Work Experience</h3>
        
        <div className="mb-4">
          <p className="mb-2">Do you have any work experience?</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setHasWorkExperience(true)}
              className={`px-6 py-2 rounded-md font-medium ${
                hasWorkExperience === true 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setHasWorkExperience(false);
                setExperiences([]);
              }}
              className={`px-6 py-2 rounded-md font-medium ${
                hasWorkExperience === false 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>
        
        {hasWorkExperience && (
          <>
            {experiences.map((exp, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md mb-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{exp.jobTitle}</p>
                  <p className="text-gray-600">{exp.company}</p>
                  {exp.startDate && exp.endDate && (
                    <p className="text-gray-500 text-sm">{exp.startDate} - {exp.endDate}</p>
                  )}
                  {exp.description && <p className="text-gray-500 text-sm mt-1">{exp.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            <div className="bg-white p-4 border border-gray-200 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={currentExperience.jobTitle}
                    onChange={handleExperienceChange}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={currentExperience.company}
                    onChange={handleExperienceChange}
                    placeholder="Company Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="text"
                    name="startDate"
                    value={currentExperience.startDate || ''}
                    onChange={handleExperienceChange}
                    placeholder="MM/YYYY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="text"
                    name="endDate"
                    value={currentExperience.endDate || ''}
                    onChange={handleExperienceChange}
                    placeholder="MM/YYYY or Present"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={currentExperience.description || ''}
                  onChange={handleExperienceChange}
                  placeholder="Brief description of your responsibilities"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mt-4 text-right">
                <button
                  type="button"
                  onClick={addExperience}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    currentExperience.jobTitle && currentExperience.company
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!currentExperience.jobTitle || !currentExperience.company}
                >
                  Add Experience
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-md text-white font-medium ${
            education.length > 0 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={education.length === 0}
        >
          Submit Application
        </button>
      </div>
    </div>
  );
};

export default ExperiencePage;
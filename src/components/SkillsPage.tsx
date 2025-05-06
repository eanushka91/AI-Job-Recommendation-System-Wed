import React, { useState, useRef } from 'react';

interface SkillsPageProps {
  initialSkills: string[];
  initialLocation?: string;
  onSubmit: (skills: string[], location: string) => void;
  onBack: () => void;
}

const suggestedSkills = [
  'React', 'TypeScript', 'CSS', 'Python', 'Java', 'SQL', 'C#', 'Docker', 'AWS', 'Git',
  'Node.js', 'HTML', 'JavaScript', 'Angular', 'Vue', 'PHP', 'Ruby', 'Go', 'Rust',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redux', 'GraphQL', 'REST API'
];

const SkillsPage: React.FC<SkillsPageProps> = ({ initialSkills, initialLocation = '', onSubmit, onBack }) => {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [inputValue, setInputValue] = useState<string>('');
  const [location, setLocation] = useState<string>(initialLocation);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddSkill = () => {
    if (inputValue.trim() && !skills.includes(inputValue.trim())) {
      setSkills([...skills, inputValue.trim()]);
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleAddSuggestedSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const handleSubmit = () => {
    onSubmit(skills, location);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Add Your Skills</h2>
      <p className="text-gray-600 mb-6">Enter your technical and soft skills to help us find relevant job matches</p>
      
      <div className="mb-6">
        <div className="flex mb-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          >
            +
          </button>
        </div>
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested skills:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter(skill => !skills.includes(skill))
              .slice(0, 10)
              .map((skill, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddSuggestedSkill(skill)}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                >
                  {skill}
                </button>
              ))}
          </div>
        </div>
        
        {/* Add location field */}
        <div className="mt-6">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Location (Optional)
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Remote, New York, London"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
            skills.length > 0 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={skills.length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SkillsPage;
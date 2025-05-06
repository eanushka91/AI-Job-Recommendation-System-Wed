import React, { useState, useEffect } from 'react';
import { JobRecommendation, ApiResponse } from '../types/types';

interface RecommendationPageProps {
  apiResponse?: ApiResponse;
  isLoading: boolean;
}

const RecommendationPage: React.FC<RecommendationPageProps> = ({ apiResponse, isLoading }) => {
  const [filteredJobs, setFilteredJobs] = useState<JobRecommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All Jobs');
  
  // Extract recommendations from the API response - memoize to prevent unnecessary re-renders
  const recommendations = React.useMemo(() => {
    return apiResponse?.job_recommendations || [];
  }, [apiResponse]);
  
  useEffect(() => {
    console.log("API Response:", apiResponse);
    console.log("Recommendations:", recommendations);
    
    // Apply filters to get filtered jobs
    let filtered = [...recommendations];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        (job.description && job.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (filterType === 'High Match') {
      filtered = filtered.filter(job => job.match_score >= 80);
    } else if (filterType === 'Mid Match') {
      filtered = filtered.filter(job => job.match_score >= 50 && job.match_score < 80);
    } else if (filterType === 'Entry Level') {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes('junior') || 
        job.title.toLowerCase().includes('entry') ||
        (job.description && job.description.toLowerCase().includes('entry level'))
      );
    }
    
    // Sort by match score
    filtered.sort((a, b) => b.match_score - a.match_score);
    
    setFilteredJobs(filtered);
  }, [recommendations, searchTerm, filterType]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };
  
  // Memoize this function to prevent unnecessary re-renders
  const getScoreColor = React.useCallback((score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  }, []);
  
  const formatHtmlContent = (html: string) => {
    return { __html: html };
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Finding your perfect job matches...</p>
        <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
      </div>
    );
  }
  
  if (recommendations.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block bg-gray-100 p-4 rounded-full mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Job Recommendations Found</h3>
        <p className="text-gray-600">We couldn't find any matching jobs based on your profile. Try updating your skills or experience.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Your Job Recommendations</h2>
      <p className="text-gray-600 mb-6">Based on your profile, we've found {recommendations.length} perfect matches for you</p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search jobs by title or company"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </div>
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option>All Jobs</option>
            <option>High Match</option>
            <option>Mid Match</option>
            <option>Entry Level</option>
          </select>
        </div>
      </div>
      
      {filteredJobs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No jobs match your current filters. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job, index) => (
            <div key={job.id || index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-700">{job.company}</p>
                  </div>
                  <div className={`${getScoreColor(job.match_score)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {Math.round(job.match_score)}% Match
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-y-2 mb-4">
                  <div className="flex items-center text-gray-600 mr-6">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {job.location}
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {job.salary}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <div 
                    className="text-gray-700 mb-2 line-clamp-3" 
                    dangerouslySetInnerHTML={formatHtmlContent(job.description)}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  {job.date_posted ? (
                    <span className="text-sm text-gray-500">
                      Posted {new Date(job.date_posted.toString()).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Recently posted</span>
                  )}
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-gray-600">Don't see what you're looking for?</p>
        <button
          type="button"
          className="mt-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
          onClick={() => window.location.reload()}
        >
          Update Your Profile
        </button>
      </div>
    </div>
  );
};

export default RecommendationPage;
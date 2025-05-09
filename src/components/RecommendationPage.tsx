import React, { useState, useEffect, useCallback } from 'react';
import { JobRecommendation, ApiResponse as SubmitApiResponse } from '../types/types';
import { loadMoreRecommendations } from '../api/Api';

interface RecommendationPageProps {
  initialApiResponse?: SubmitApiResponse;
  isLoadingInitially: boolean;
  resumeId: number;
  initialLocation?: string;
}

const RecommendationPage: React.FC<RecommendationPageProps> = ({
  initialApiResponse,
  isLoadingInitially,
  resumeId,
  initialLocation,
}) => {
  const [allJobs, setAllJobs] = useState<JobRecommendation[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobRecommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All Jobs');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isComponentLoading, setIsComponentLoading] = useState<boolean>(isLoadingInitially);

  useEffect(() => {
    if (initialApiResponse?.job_recommendations_initial) {
      const initialData = initialApiResponse.job_recommendations_initial;
      setAllJobs(initialData.items || []);
      setCurrentPage(initialData.page || 1);
      setHasMore(initialData.has_next || false); // Ensure hasMore is correctly set
      setIsComponentLoading(false);
    } else if (isLoadingInitially) {
      setIsComponentLoading(true);
    } else {
      // Handles cases like direct navigation or if initialApiResponse is unexpectedly undefined
      setIsComponentLoading(false);
      setAllJobs([]);
      setHasMore(false);
    }
  }, [initialApiResponse, isLoadingInitially]);

  useEffect(() => {
    let newFilteredJobs = [...allJobs];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      newFilteredJobs = newFilteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        (job.description && job.description.toLowerCase().includes(searchLower))
      );
    }

    if (filterType === 'High Match') {
      newFilteredJobs = newFilteredJobs.filter(job => job.match_score >= 75);
    } else if (filterType === 'Mid Match') {
      newFilteredJobs = newFilteredJobs.filter(job => job.match_score >= 50 && job.match_score < 75);
    } else if (filterType === 'Entry Level') {
      newFilteredJobs = newFilteredJobs.filter(job => job.match_score >= 25 && job.match_score < 50);
    }

    newFilteredJobs.sort((a, b) => b.match_score - a.match_score);
    setFilteredJobs(newFilteredJobs);
  }, [allJobs, searchTerm, filterType]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPageToFetch = currentPage + 1;
      const pageSize = initialApiResponse?.job_recommendations_initial?.size || 10;
      const newRecommendationsData = await loadMoreRecommendations(resumeId, initialLocation, nextPageToFetch, pageSize);

      if (newRecommendationsData.items && newRecommendationsData.items.length > 0) {
        // Filter out duplicates that might already be in allJobs (optional, good practice)
        const newUniqueJobs = newRecommendationsData.items.filter(newItem => !allJobs.some(existingItem => existingItem.id === newItem.id));
        setAllJobs(prevJobs => [...prevJobs, ...newUniqueJobs]);
      }
      setCurrentPage(newRecommendationsData.page);
      setHasMore(newRecommendationsData.has_next);
    } catch (error) {
      console.error("Failed to load more jobs:", error);
      alert("Could not load more jobs. Please try again later.");
      setHasMore(false); // Prevent further attempts if an error occurs
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  const getScoreColor = useCallback((score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-red-500'; // Changed to red for low scores
  }, []);

  const formatHtmlContent = (html: string | undefined) => {
    // Basic sanitization or use a library like DOMPurify if HTML is complex/untrusted
    return { __html: html || '' };
  };
  
  const handleUpdateProfile = () => {
    // This is a basic way to go back to the start.
    // A more robust solution would involve a callback from MainForm to set the step.
    window.location.href = '/'; // Or the path to your form's first step
  };


  if (isComponentLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Finding your perfect job matches...</p>
        <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
      </div>
    );
  }

  if (allJobs.length === 0 && !isLoadingMore && !isComponentLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block bg-gray-100 p-4 rounded-full mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Job Recommendations Found</h3>
        <p className="text-gray-600">We couldn't find any matching jobs for your profile. You can try updating it.</p>
        <button
          onClick={handleUpdateProfile}
          className="mt-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
        >
         Update Your Profile
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Your Job Recommendations</h2>
      <p className="text-gray-600 mb-6">
        {initialApiResponse?.job_recommendations_initial?.total ? `Found ${initialApiResponse.job_recommendations_initial.total} potential matches. ` : ''}
        Displaying {allJobs.length} recommendations.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by title, company, or keyword"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
           <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          </div>
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          >
            <option>All Jobs</option>
            <option>High Match</option>
            <option>Mid Match</option>
            <option>Entry Level</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 && !isLoadingMore ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg shadow">
          <p className="text-gray-600">No jobs match your current filters. Try adjusting your search or loading more jobs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job, index) => (
            <div key={job.id ? `job-${job.id}-${index}` : `job-index-${index}`} className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                    </h3>
                    <p className="text-gray-700">{job.company}</p>
                  </div>
                  <div className={`${getScoreColor(job.match_score)} text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap`}>
                    {job.match_score ? `${Math.round(job.match_score)}% Match` : 'N/A'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {job.location || 'Not specified'}
                  </div>
                  {job.salary && (
                    <div className="flex items-center">
                       <svg className="h-4 w-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {job.salary}
                    </div>
                  )}
                </div>

                {job.description && (
                  <div className="mb-4">
                    <div
                      className="text-gray-700 text-sm prose prose-sm max-w-none line-clamp-3"
                      dangerouslySetInnerHTML={formatHtmlContent(job.description)}
                    />
                  
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 mt-4">
                  <span className="text-xs text-gray-500 mb-2 sm:mb-0">
                    {job.date_posted ? `Posted: ${new Date(job.date_posted.toString()).toLocaleDateString()}` : 'Recently posted'}
                  </span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !isLoadingMore && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md hover:shadow-lg"
            disabled={isLoadingMore}
          >
            Load More Jobs
          </button>
        </div>
      )}
      {isLoadingMore && (
         <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500 mt-3">Loading more jobs...</p>
        </div>
      )}

      <div className="mt-12 text-center border-t pt-8">
        <p className="text-gray-600 mb-3">Don't see what you're looking for or want to refine results?</p>
        <button
          type="button"
          className="px-5 py-2 border border-blue-500 text-blue-500 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          onClick={handleUpdateProfile}
        >
          Update Your Profile
        </button>
      </div>
    </div>
  );
};

export default RecommendationPage;
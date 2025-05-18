// src/api/__mocks__/Api.ts
import { ApiResponse, PaginatedJobRecommendations } from '../../types/types'; // Adjust path if your types are elsewhere

// Default successful response for initial profile submission
const mockSuccessfulProfileResponse: ApiResponse = {
  message: 'Profile submitted successfully',
  url: 'mock/cv/url.pdf',
  user_id: 123,
  resume_id: 456,
  job_recommendations_initial: {
    items: [
      { 
        id: 'job1', 
        title: 'Mock Job 1', 
        company: 'Mock Co', 
        location: 'Remote', 
        match_score: 80, 
        description: 'Desc1', 
        url: 'http://mock.url/job1',
        date_posted: new Date().toISOString(),
        salary: '$100,000'
      },
    ],
    total: 1,
    page: 1,
    size: 10,
    pages: 1,
    has_next: false,
    has_prev: false,
  },
};

// Default successful response for loading more recommendations
const mockDefaultLoadMoreResponse: PaginatedJobRecommendations = {
  items: [], // Default to no new items
  total: 0, 
  page: 2,
  size: 10,
  pages: 1, 
  has_next: false, 
  has_prev: true,
};

// Exported mock functions
export const submitProfile = jest.fn(() => Promise.resolve(mockSuccessfulProfileResponse));
export const loadMoreRecommendations = jest.fn(() => Promise.resolve(mockDefaultLoadMoreResponse));

// --- Helper functions to control mock behavior from tests ---

// For submitProfile
export const __setSubmitProfileResponse = (response?: ApiResponse, isError: boolean = false) => {
  if (isError) {
    (submitProfile as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(response || new Error("Mocked submitProfile error"))
    );
  } else {
    (submitProfile as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(response || mockSuccessfulProfileResponse)
    );
  }
};

export const __getMockSuccessfulProfileResponse = () => mockSuccessfulProfileResponse;

// For loadMoreRecommendations
export const __setLoadMoreRecommendationsResponse = (response?: PaginatedJobRecommendations, isError: boolean = false) => {
  if (isError) {
    (loadMoreRecommendations as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(response || new Error("Mocked loadMoreRecommendations error"))
    );
  } else {
    (loadMoreRecommendations as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve(response || mockDefaultLoadMoreResponse)
    );
  }
};

export const __getMockDefaultLoadMoreResponse = () => mockDefaultLoadMoreResponse;

// Helper to reset all implementations and clear calls (useful in beforeEach)
export const __resetApiMocks = () => {
  (submitProfile as jest.Mock).mockReset();
  // Set a default implementation after reset if needed, or let tests define it.
  (submitProfile as jest.Mock).mockImplementation(() => Promise.resolve(mockSuccessfulProfileResponse));


  (loadMoreRecommendations as jest.Mock).mockReset();
  (loadMoreRecommendations as jest.Mock).mockImplementation(() => Promise.resolve(mockDefaultLoadMoreResponse));
};

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { submitProfile, loadMoreRecommendations } from '../api/Api';
import { UserProfile, PaginatedJobRecommendations } from '../types/types';

// Mock fetch globally
global.fetch = jest.fn();

// Create a proper mock for FormData
class MockFormData {
  append = jest.fn();
  delete = jest.fn();
  get = jest.fn();
  getAll = jest.fn();
  has = jest.fn();
  set = jest.fn();
  entries = jest.fn().mockImplementation(() => [][Symbol.iterator]());
  forEach = jest.fn();
  keys = jest.fn().mockImplementation(() => [][Symbol.iterator]());
  values = jest.fn().mockImplementation(() => [][Symbol.iterator]());
  [Symbol.iterator] = jest.fn().mockImplementation(() => [][Symbol.iterator]());
}

// Replace global FormData with our mock
global.FormData = MockFormData as unknown as typeof global.FormData;

describe('API functions', () => {
  const mockUserProfile: UserProfile = {
    skills: ['JavaScript', 'React', 'TypeScript'],
    experiences: [
      { jobTitle: 'Software Engineer', company: 'Tech Co', startDate: '2020-01', endDate: '2022-01' },
      { jobTitle: 'Frontend Developer', company: 'Web Inc', startDate: '2018-01', endDate: '2020-01' }
    ],
    education: [
      { degree: 'BS Computer Science', institution: 'University', graduationDate: '2018' }
    ],
    location: 'New York',
    cv: new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' })
  };

  const mockPaginatedResponse: PaginatedJobRecommendations = {
    items: [
      {
        id: 1,
        title: 'Software Engineer',
        company: 'Tech Co',
        location: 'New York',
        description: 'Job description here',
        match_score: 90,
        url: 'https://example.com/job/1',
        date_posted: '2023-05-10'
      },
      {
        id: 2,
        title: 'Frontend Developer',
        company: 'Web Inc',
        location: 'Remote',
        description: 'Another job description',
        match_score: 85,
        url: 'https://example.com/job/2',
        date_posted: '2023-05-12'
      }
    ],
    total: 25,
    page: 1,
    size: 10,
    pages: 3,
    has_next: true,
    has_prev: false
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitProfile', () => {
    it('should successfully submit a profile and return recommendations', async () => {
      // Mock successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: 'Profile submitted successfully',
          url: 'http://example.com/profile',
          user_id: 123,
          resume_id: 456,
          recommendations: mockPaginatedResponse
        })
      });

      const result = await submitProfile(mockUserProfile);

      // Check that fetch was called with the right arguments
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/upload-cv', {
        method: 'POST',
        body: expect.any(FormData)
      });

      // Check the returned data
      expect(result).toEqual({
        message: 'Profile submitted successfully',
        url: 'http://example.com/profile',
        user_id: 123,
        resume_id: 456,
        job_recommendations_initial: mockPaginatedResponse
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          message: 'Invalid file format'
        })
      });

      await expect(submitProfile(mockUserProfile)).rejects.toThrow('Invalid file format');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/upload-cv', {
        method: 'POST',
        body: expect.any(FormData)
      });
    });

    it('should handle network errors', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(submitProfile(mockUserProfile)).rejects.toThrow('Network error');
    });

    it('should handle empty profile submission', async () => {
      const emptyProfile: UserProfile = {
        skills: [],
        experiences: [],
        education: [],
        location: '',
      };

      // Mock successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: 'Empty profile submitted',
          user_id: 123,
          resume_id: 456,
          recommendations: { items: [], total: 0, page: 1, size: 10, pages: 0, has_next: false, has_prev: false }
        })
      });

      const result = await submitProfile(emptyProfile);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/upload-cv', {
        method: 'POST',
        body: expect.any(FormData)
      });

      expect(result.job_recommendations_initial.items).toHaveLength(0);
    });
  });

  describe('loadMoreRecommendations', () => {
    it('should load more recommendations successfully', async () => {
      // Mock successful response for page 2
      const page2Response = {
        ...mockPaginatedResponse,
        page: 2,
        has_prev: true,
        items: [
          {
            id: 3,
            title: 'Senior Developer',
            company: 'Big Corp',
            location: 'Boston',
            description: 'Senior role description',
            match_score: 80,
            url: 'https://example.com/job/3',
            date_posted: '2023-05-14'
          },
          {
            id: 4,
            title: 'Full Stack Engineer',
            company: 'Startup',
            location: 'Remote',
            description: 'Full stack role',
            match_score: 75,
            url: 'https://example.com/job/4',
            date_posted: '2023-05-15'
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          recommendations: page2Response
        })
      });

      const result = await loadMoreRecommendations(456, 'New York', 2, 10);

      // Check that fetch was called with the right URL and params
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/recommendations/456?page=2&size=10&location=New+York',
        { method: 'GET' }
      );

      // Check the returned data
      expect(result).toEqual(page2Response);
      expect(result.page).toBe(2);
      expect(result.has_prev).toBe(true);
      expect(result.items).toHaveLength(2);
    });

    it('should work without location parameter', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          recommendations: mockPaginatedResponse
        })
      });

      await loadMoreRecommendations(456, undefined, 1, 10);

      // Verify no location in URL
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/recommendations/456?page=1&size=10',
        { method: 'GET' }
      );
    });

    it('should handle API errors when loading more recommendations', async () => {
      // Mock failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          message: 'Invalid resume ID'
        })
      });

      await expect(loadMoreRecommendations(999, 'New York', 1, 10)).rejects.toThrow('Invalid resume ID');
    });

    it('should handle missing recommendations in the response', async () => {
      // Mock response with missing recommendations
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})  // Empty response, no recommendations field
      });

      const result = await loadMoreRecommendations(456, 'New York', 1, 10);
      
      // Should return default empty pagination structure
      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
        has_next: false,
        has_prev: false
      });
    });

    it('should use default page size when not specified', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ // Changed from (fetch as any)
        ok: true,
        json: () => Promise.resolve({
          recommendations: mockPaginatedResponse
        })
      });

      await loadMoreRecommendations(456, 'New York', 1); // No size specified

      // Should use default size of 10
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/recommendations/456?page=1&size=10&location=New+York',
        { method: 'GET' }
      );
    });
  });
});
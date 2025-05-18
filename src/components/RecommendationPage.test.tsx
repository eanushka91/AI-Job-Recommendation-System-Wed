// RecommendationPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import types needed
import { ApiResponse as SubmitApiResponse, JobRecommendation, PaginatedJobRecommendations } from '../types/types'; // Adjust path

// --- 1. Define the core mock function(s) for this test file's scope ---
const mockLoadMoreRecommendationsImplementation = jest.fn();
// If other functions from Api.ts were used by RecommendationPage, define their mocks here too.
// const mockSubmitProfileImplementation = jest.fn(); 

// --- 2. Mock the API module using these pre-defined functions ---
// This MUST be at the top-level, before other imports like the component itself.
jest.mock('../api/Api', () => ({
  __esModule: true, // Good practice for ES modules
  loadMoreRecommendations: mockLoadMoreRecommendationsImplementation,
  // submitProfile: mockSubmitProfileImplementation, // Example if it were used
  // Ensure all exports from the actual ../api/Api module that RecommendationPage might
  // directly or indirectly use are mocked here, even if just with jest.fn()
  // For example, if Api.ts also exports submitProfile, even if RecommendationPage
  // doesn't use it directly, it should be listed:
  submitProfile: jest.fn(), 
  // Add any other named exports from your actual Api.ts file here, mocked.
  // If you have helper functions like __setLoadMoreRecommendationsResponse exported from the *actual* Api.ts (which is unlikely)
  // they would also need to be listed here. But typically, those helpers are only in the __mocks__ file or test file.
}));

// --- 3. Import the component under test AFTER mocks are set up ---
import RecommendationPage from './RecommendationPage';

// --- 4. Define mock data and test-specific helpers ---
const mockInitialRecPageApiResponse: SubmitApiResponse = {
  message: 'Initial recommendations loaded',
  url: 'cv.pdf',
  user_id: 1,
  resume_id: 100, 
  job_recommendations_initial: {
    items: [
      { id: 'job1', title: 'Frontend Developer', company: 'Tech Solutions', location: 'New York', match_score: 85, description: '<p>Join our frontend team!</p>', url: 'http://apply.dev/1', date_posted: new Date(2024, 0, 15).toISOString(), salary: '$110k' },
      { id: 'job2', title: 'Backend Engineer (Node.js)', company: 'Data Corp', location: 'Remote', match_score: 70, description: 'Work with backend services.', url: 'http://apply.data/2', date_posted: new Date(2024, 0, 10).toISOString() },
      { id: 'job3', title: 'UX Designer Pro', company: 'Creative Designs', location: 'San Francisco', match_score: 40, description: 'Design amazing user experiences.', url: 'http://apply.ux/3', date_posted: new Date(2024, 0, 5).toISOString() },
    ],
    total: 25, page: 1, size: 3, pages: 9, has_next: true, has_prev: false,
  },
};

const mockEmptyInitialRecPageApiResponse: SubmitApiResponse = {
    message: 'No initial recommendations', url: 'cv.pdf', user_id: 1, resume_id: 101,
    job_recommendations_initial: { items: [], total: 0, page: 1, size: 10, pages: 0, has_next: false, has_prev: false },
};

const defaultMockLoadMoreSuccessResponse: PaginatedJobRecommendations = {
    items: [], total: mockInitialRecPageApiResponse.job_recommendations_initial.total, 
    page: 2, size: 3, pages: 9, has_next: false, has_prev: true,
};

// Mock window.location.href
const originalWindowLocation = window.location;
beforeAll(() => {
    // @ts-expect-error Test environment, deliberately changing location
    delete window.location;
    // @ts-expect-error Test environment, deliberately changing location
    window.location = { ...originalWindowLocation, href: '', assign: jest.fn(), replace: jest.fn() };
});
afterAll(() => {
    // @ts-expect-error Test environment, restoring original location
    window.location = originalWindowLocation;
});

const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('RecommendationPage', () => {
  beforeEach(() => {
    mockLoadMoreRecommendationsImplementation.mockReset();
    // Set a default successful implementation for loadMore for most tests
    mockLoadMoreRecommendationsImplementation.mockImplementation(() => 
        Promise.resolve(defaultMockLoadMoreSuccessResponse)
    );
    alertMock.mockClear();
    // @ts-expect-error Test environment, clearing mocks
    if (window.location.assign.mockClear) (window.location.assign as jest.Mock).mockClear();
    // @ts-expect-error Test environment, clearing mocks
    if (window.location.replace.mockClear) (window.location.replace as jest.Mock).mockClear();
     if (typeof window.location.href === 'string') { 
        window.location.href = '';
    }
  });

  test('renders loading state when isLoadingInitially is true', () => {
    render(
      <RecommendationPage
        initialApiResponse={undefined}
        isLoadingInitially={true}
        resumeId={mockInitialRecPageApiResponse.resume_id}
        initialLocation="Anywhere"
      />
    );
    expect(screen.getByText(/Finding your perfect job matches.../i)).toBeInTheDocument();
  });

  test('renders with initial job recommendations correctly', () => {
    render(
      <RecommendationPage
        initialApiResponse={mockInitialRecPageApiResponse}
        isLoadingInitially={false}
        resumeId={mockInitialRecPageApiResponse.resume_id}
        initialLocation="New York"
      />
    );
    expect(screen.getByRole('heading', {name: /Your Job Recommendations/i})).toBeInTheDocument();
    expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/Displaying 3 recommendations./i)).toBeInTheDocument();
  });

  test('renders "No Job Recommendations Found" when initial items are empty', () => {
    render(
      <RecommendationPage
        initialApiResponse={mockEmptyInitialRecPageApiResponse}
        isLoadingInitially={false}
        resumeId={mockEmptyInitialRecPageApiResponse.resume_id}
      />
    );
    expect(screen.getByText(/No Job Recommendations Found/i)).toBeInTheDocument();
  });

  test('filters jobs by search term in title', () => {
    render(<RecommendationPage initialApiResponse={mockInitialRecPageApiResponse} isLoadingInitially={false} resumeId={100} />);
    fireEvent.change(screen.getByPlaceholderText(/Search by title, company, or keyword/i), { target: { value: 'Frontend' } });
    expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();
    expect(screen.queryByText(/Backend Engineer \(Node.js\)/i)).not.toBeInTheDocument();
  });
  
  test('filters jobs by match score (High Match: >=75)', () => {
    render(<RecommendationPage initialApiResponse={mockInitialRecPageApiResponse} isLoadingInitially={false} resumeId={100} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'High Match' } });
    expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument(); // Score 85
    expect(screen.queryByText(/Backend Engineer \(Node.js\)/i)).not.toBeInTheDocument(); // Score 70
  });

  test('filters jobs by match score (Mid Match: >=50 & <75)', () => {
    render(<RecommendationPage initialApiResponse={mockInitialRecPageApiResponse} isLoadingInitially={false} resumeId={100} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mid Match' } });
    expect(screen.queryByText(/Frontend Developer/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Backend Engineer \(Node.js\)/i)).toBeInTheDocument(); // Score 70
  });

  test('handles "Load More Jobs" successfully and appends new jobs', async () => {
    const moreJobs: JobRecommendation[] = [
      { id: 'job4', title: 'DevOps Engineer', company: 'Cloud Services', location: 'Austin', match_score: 78, description: 'Manage infra.', url: 'http://apply.devops/4' },
    ];
    const loadMoreSuccessData: PaginatedJobRecommendations = {
      items: moreJobs, total: mockInitialRecPageApiResponse.job_recommendations_initial.total, 
      page: 2, size: 3, pages: 9, has_next: true, has_prev: true,
    };
    mockLoadMoreRecommendationsImplementation.mockImplementationOnce(() => Promise.resolve(loadMoreSuccessData));

    render(<RecommendationPage initialApiResponse={mockInitialRecPageApiResponse} isLoadingInitially={false} resumeId={100} initialLocation="New York" />);
    fireEvent.click(screen.getByRole('button', { name: /Load More Jobs/i }));
    expect(screen.getByText(/Loading more jobs.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/DevOps Engineer/i)).toBeInTheDocument(); 
    });
    expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument(); 
    expect(mockLoadMoreRecommendationsImplementation).toHaveBeenCalledWith(100, "New York", 2, 3); 
    expect(screen.getByText(/Displaying 4 recommendations./i)).toBeInTheDocument(); 
  });

  test('hides "Load More Jobs" button when has_next is false after loading', async () => {
    const finalJobs: JobRecommendation[] = [
      { id: 'job5', title: 'Final Job', company: 'End Corp', location: 'Remote', match_score: 60, description: 'Last one.', url: 'http://apply.end/5' },
    ];
    const finalLoadResponse: PaginatedJobRecommendations = {
      items: finalJobs, total: mockInitialRecPageApiResponse.job_recommendations_initial.total, 
      page: 2, 
      size: 3, pages: 9, has_next: false, has_prev: true,
    };
    mockLoadMoreRecommendationsImplementation.mockImplementationOnce(() => Promise.resolve(finalLoadResponse));

    render(<RecommendationPage initialApiResponse={mockInitialRecPageApiResponse} isLoadingInitially={false} resumeId={100} />);
    fireEvent.click(screen.getByRole('button', { name: /Load More Jobs/i }));

    await waitFor(() => {
      expect(screen.getByText(/Final Job/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Load More Jobs/i })).not.toBeInTheDocument();
  });

  test('handles "Load More Jobs" API failure gracefully', async () => {
    const apiError = new Error("API Load More Error");
    mockLoadMoreRecommendationsImplementation.mockImplementationOnce(() => Promise.reject(apiError));

    render(<RecommendationPage initialApiResponse={mockInitialRecPageApiResponse} isLoadingInitially={false} resumeId={100} />);
    fireEvent.click(screen.getByRole('button', { name: /Load More Jobs/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Could not load more jobs. Please try again later.");
    });
    expect(mockLoadMoreRecommendationsImplementation).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Loading more jobs.../i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Load More Jobs/i })).not.toBeInTheDocument(); 
  });
  
  test('"Update Your Profile" button (when no jobs) calls window.location.href', () => {
    render( <RecommendationPage initialApiResponse={mockEmptyInitialRecPageApiResponse} isLoadingInitially={false} resumeId={101} />);
    fireEvent.click(screen.getByRole('button', { name: /Update Your Profile/i }));
    expect(window.location.href).toBe('/');
  });

  test('"Update Your Profile" button (at the bottom) calls window.location.href', () => {
    render( <RecommendationPage initialApiResponse={mockInitialRecPageApiResponse} isLoadingInitially={false} resumeId={100} />);
    const updateButtons = screen.getAllByRole('button', { name: /Update Your Profile/i });
    const bottomUpdateProfileButton = updateButtons.find(btn => btn.closest('div.mt-12')); 
    expect(bottomUpdateProfileButton).toBeInTheDocument();
    if (bottomUpdateProfileButton) fireEvent.click(bottomUpdateProfileButton);
    expect(window.location.href).toBe('/');
  });
});

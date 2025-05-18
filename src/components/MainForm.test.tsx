// MainForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import types needed for mock props and API response
import { Experience, Education, ApiResponse as SubmitApiResponse } from '../types/types'; // Adjust path

// --- 1. Define the core mock function(s) ---
const mockSubmitProfileImplementation = jest.fn();
const mockLoadMoreRecommendationsImplementation = jest.fn(() => Promise.resolve({
  items: [], total: 0, page: 2, size: 10, pages: 1, has_next: false, has_prev: false
}));

// --- 2. Mock the API module using these pre-defined functions ---
jest.mock('../api/Api', () => ({
  __esModule: true,
  submitProfile: mockSubmitProfileImplementation,
  loadMoreRecommendations: mockLoadMoreRecommendationsImplementation,
}));

// --- 3. Import the component under test AFTER mocks ---
import MainForm from './MainForm';

// --- 4. Define mock data ---
const mockSuccessfulProfileResponseData: SubmitApiResponse = {
  message: 'Profile submitted successfully (mocked inline)',
  url: 'mock/cv/url.pdf',
  user_id: 789,
  resume_id: 101,
  job_recommendations_initial: {
    items: [
      { id: 'mockJob1', title: 'Mocked Inline Job 1', company: 'Inline Mock Co', location: 'Mock Remote', match_score: 85, description: 'Desc Mocked Inline', url: 'urlMocked1' },
    ],
    total: 1, page: 1, size: 10, pages: 1, has_next: false, has_prev: false,
  },
};

// Mock child components
jest.mock('./CVUploadPage', () => (props: { onUpload: (file: File) => void }) => (
    <div data-testid="mock-cvuploadpage">
      <button onClick={() => props.onUpload(new File(['cv'], 'cv.pdf', { type: 'application/pdf' }))}>
        Mock CV Upload
      </button>
    </div>
  ));
interface MockSkillsPageProps { onSubmit: (skills: string[], location: string) => void; onBack: () => void; }
jest.mock('./SkillsPage', () => (props: MockSkillsPageProps) => (
    <div data-testid="mock-skillspage">
      <button onClick={() => props.onSubmit(['React', 'JS'], 'Remote')}>Mock Skills Submit</button>
      <button onClick={props.onBack}>Mock Skills Back</button>
    </div>
  ));
interface MockExperiencePageProps { onSubmit: (experiences: Experience[], education: Education[]) => void; onBack: () => void; }
jest.mock('./ExperiencePage', () => (props: MockExperiencePageProps) => (
    <div data-testid="mock-experiencepage">
      <button onClick={() => props.onSubmit(
        [{ jobTitle: 'Dev', company: 'Co', description: 'Desc', startDate: '2020', endDate: '2021' }],
        [{ degree: 'BSc', institution: 'Uni', graduationDate: '2020' }]
      )}>
        Mock Experience Submit
      </button>
      <button onClick={props.onBack}>Mock Experience Back</button>
    </div>
  ));
interface MockRecommendationPageProps { resumeId: number; initialLocation?: string; initialApiResponse?: SubmitApiResponse; }
jest.mock('./RecommendationPage', () => (props: MockRecommendationPageProps) => (
    <div data-testid="mock-recommendationpage">
      <p>Resume ID: {props.resumeId}</p>
      <p>Location: {String(props.initialLocation)}</p>
      {props.initialApiResponse?.job_recommendations_initial?.items.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  ));

const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('MainForm', () => {
  beforeEach(() => {
    mockSubmitProfileImplementation.mockReset();
    mockLoadMoreRecommendationsImplementation.mockReset();
    alertMock.mockClear();
    // Default to success for most tests
    mockSubmitProfileImplementation.mockImplementation(() => 
      Promise.resolve(mockSuccessfulProfileResponseData)
    );
  });

  test('renders initial step (CVUploadPage) and progress bar correctly', () => {
    render(<MainForm />);
    expect(screen.getByText('Career Compass')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cvuploadpage')).toBeInTheDocument();
    expect(screen.getByText('Upload CV')).toHaveClass('text-blue-600');
    expect(screen.getByText('Add Skills & Location')).toHaveClass('text-gray-500');
  });

  test('navigates from CV Upload to SkillsPage', () => {
    render(<MainForm />);
    fireEvent.click(screen.getByText('Mock CV Upload'));
    expect(screen.queryByTestId('mock-cvuploadpage')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-skillspage')).toBeInTheDocument();
    expect(screen.getByText('Add Skills & Location')).toHaveClass('text-blue-600');
  });

  test('navigates from SkillsPage to ExperiencePage', () => {
    render(<MainForm />);
    fireEvent.click(screen.getByText('Mock CV Upload'));
    fireEvent.click(screen.getByText('Mock Skills Submit'));
    expect(screen.queryByTestId('mock-skillspage')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-experiencepage')).toBeInTheDocument();
    expect(screen.getByText('Add Experience & Education')).toHaveClass('text-blue-600');
  });

  test('navigates back from SkillsPage to CVUploadPage', () => {
    render(<MainForm />);
    fireEvent.click(screen.getByText('Mock CV Upload'));
    expect(screen.getByTestId('mock-skillspage')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mock Skills Back'));
    expect(screen.getByTestId('mock-cvuploadpage')).toBeInTheDocument();
    expect(screen.getByText('Upload CV')).toHaveClass('text-blue-600');
  });

  describe('Experience Submission and API call', () => {
    test('shows loading state and then RecommendationPage on successful API call', async () => {
      // Uses default success from beforeEach
      render(<MainForm />);
      fireEvent.click(screen.getByText('Mock CV Upload'));
      fireEvent.click(screen.getByText('Mock Skills Submit'));
      fireEvent.click(screen.getByText('Mock Experience Submit'));

      expect(screen.getByText(/Generating recommendations.../i)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByTestId('mock-recommendationpage')).toBeInTheDocument();
      });
      expect(screen.queryByText(/Generating recommendations.../i)).not.toBeInTheDocument();
      expect(mockSubmitProfileImplementation).toHaveBeenCalledTimes(1);
      expect(screen.getByText(`Resume ID: ${mockSuccessfulProfileResponseData.resume_id}`)).toBeInTheDocument();
    });

    test('shows error message on failed API call', async () => {
      const apiError = { message: 'Network Error From Test For Error UI' };
      // **** CRITICAL CHANGE FOR THIS TEST ****
      // Reset and set ONLY the reject implementation for this specific test
      mockSubmitProfileImplementation.mockReset(); 
      mockSubmitProfileImplementation.mockImplementationOnce(() => Promise.reject(apiError));

      render(<MainForm />);
      fireEvent.click(screen.getByText('Mock CV Upload'));
      fireEvent.click(screen.getByText('Mock Skills Submit'));
      fireEvent.click(screen.getByText('Mock Experience Submit'));

      expect(screen.getByText(/Generating recommendations.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Oops! Something went wrong./i)).toBeInTheDocument();
      });
      expect(screen.queryByTestId('mock-recommendationpage')).not.toBeInTheDocument();
      expect(mockSubmitProfileImplementation).toHaveBeenCalledTimes(1);
      expect(alertMock).toHaveBeenCalledWith('Failed to get job recommendations. Please check your input or try again later.');
    });

    test('allows going back from error message after failed API call', async () => {
      const apiError = { message: 'Another Network Error For Go Back Test' };
      // **** CRITICAL CHANGE FOR THIS TEST ****
      // Reset and set ONLY the reject implementation for this specific test
      mockSubmitProfileImplementation.mockReset();
      mockSubmitProfileImplementation.mockImplementationOnce(() => Promise.reject(apiError));

      render(<MainForm />);
      fireEvent.click(screen.getByText('Mock CV Upload'));
      fireEvent.click(screen.getByText('Mock Skills Submit'));
      fireEvent.click(screen.getByText('Mock Experience Submit'));

      await waitFor(() => {
        expect(screen.getByText(/Oops! Something went wrong./i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Go Back/i }));
      expect(screen.getByTestId('mock-experiencepage')).toBeInTheDocument();
      expect(screen.getByText('Add Experience & Education')).toHaveClass('text-blue-600');
    });
  });
});

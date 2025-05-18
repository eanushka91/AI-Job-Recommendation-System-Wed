// ExperiencePage.test.tsx
import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExperiencePage from './ExperiencePage'; // Adjust path if necessary
import { Experience, Education } from '../types/types'; // Adjust path to your types

const mockOnSubmit = jest.fn();
const mockOnBack = jest.fn();

// Mock window.alert
const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

const initialExperiences: Experience[] = [];
const initialEducation: Education[] = [];

describe('ExperiencePage', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnBack.mockClear();
    alertMock.mockClear();
  });

  test('renders initial state correctly', () => {
    render(
      <ExperiencePage
        initialExperiences={initialExperiences}
        initialEducation={initialEducation}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByRole('heading', { name: /Add Experience & Education/i })).toBeInTheDocument();
    // Education section
    expect(screen.getByRole('heading', { name: /Education Details/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Bachelor of Science/i)).toBeInTheDocument(); // Degree
    expect(screen.getByPlaceholderText(/University Name/i)).toBeInTheDocument(); // Institution
    expect(screen.getByRole('button', { name: /Add Education/i })).toBeDisabled();

    // Experience section
    expect(screen.getByRole('heading', { name: /Work Experience/i })).toBeInTheDocument();
    expect(screen.getByText(/Do you have any work experience\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(screen.getByText(/Please select whether you have work experience./i)).toBeInTheDocument(); // Error for null hasWorkExperience

    // Buttons
    expect(screen.getByRole('button', { name: /Submit Application/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  test('renders with initial education and experience data', () => {
    const educations: Education[] = [{ degree: 'BSc', institution: 'Test Uni', graduationDate: '2020' }];
    const experiences: Experience[] = [{ jobTitle: 'Dev', company: 'Test Co', startDate: '2021', endDate: '2022' }];
    render(
      <ExperiencePage
        initialExperiences={experiences}
        initialEducation={educations}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );
    // Check education
    expect(screen.getByText(educations[0].degree)).toBeInTheDocument();
    expect(screen.getByText(educations[0].institution)).toBeInTheDocument();

    // Check experience (hasWorkExperience should be true)
    expect(screen.queryByText(/Please select whether you have work experience./i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toHaveClass('bg-blue-600'); // Active
    expect(screen.getByText(experiences[0].jobTitle)).toBeInTheDocument();
    expect(screen.getByText(experiences[0].company)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Application/i })).toBeEnabled();
  });

  describe('Education Section', () => {
    test('allows adding and removing an education entry', () => {
      render(
        <ExperiencePage
          initialExperiences={[]}
          initialEducation={[]}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      );
      // Select No for work experience to enable submit button later with just education
      fireEvent.click(screen.getByRole('button', { name: 'No' }));


      const degreeInput = screen.getByPlaceholderText(/Bachelor of Science/i);
      const institutionInput = screen.getByPlaceholderText(/University Name/i);
      const gradDateInput = screen.getByPlaceholderText(/MM\/YYYY/i); // Graduation Date
      const addEducationButton = screen.getByRole('button', { name: /Add Education/i });

      // Fields for first education
      fireEvent.change(degreeInput, { target: { value: 'MSc Computer Science' } });
      fireEvent.change(institutionInput, { target: { value: 'Tech University' } });
      fireEvent.change(gradDateInput, { target: { value: '12/2022' } });
      expect(addEducationButton).toBeEnabled();
      fireEvent.click(addEducationButton);

      // Check if added and form cleared
      expect(screen.getByText('MSc Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Tech University')).toBeInTheDocument();
      expect(screen.getByText('Graduation: 12/2022')).toBeInTheDocument();
      expect(degreeInput).toHaveValue('');
      expect(institutionInput).toHaveValue('');
      expect(screen.getByRole('button', { name: /Submit Application/i })).toBeEnabled();


      // Add another education
      fireEvent.change(degreeInput, { target: { value: 'PhD AI' } });
      fireEvent.change(institutionInput, { target: { value: 'Research Institute' } });
      fireEvent.click(addEducationButton);
      expect(screen.getByText('PhD AI')).toBeInTheDocument();

      // Remove the first education entry
      const educationEntries = screen.getAllByText(/Graduation:/i).map(el => el.closest('div.bg-gray-50') as HTMLElement);
      const firstEntryRemoveButton = within(educationEntries[0]).getByRole('button');
      fireEvent.click(firstEntryRemoveButton);

      expect(screen.queryByText('MSc Computer Science')).not.toBeInTheDocument();
      expect(screen.getByText('PhD AI')).toBeInTheDocument(); // Second one remains
      expect(screen.getByRole('button', { name: /Submit Application/i })).toBeEnabled(); // Still enabled

      // Remove the second (last) education entry
      const lastEntryContainer = screen.getByText('PhD AI').closest('div.bg-gray-50') as HTMLElement;
      const lastEntryRemoveButton = within(lastEntryContainer).getByRole('button');
      fireEvent.click(lastEntryRemoveButton);
      expect(screen.queryByText('PhD AI')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Application/i })).toBeDisabled(); // Disabled as no education
    });
  });

  describe('Work Experience Section', () => {
    test('selecting "No" for work experience hides form and clears experiences', () => {
       // Start with some initial experience to test clearing
      const experiences: Experience[] = [{ jobTitle: 'Old Job', company: 'Old Co' }];
      render(
        <ExperiencePage
          initialExperiences={experiences}
          initialEducation={[{degree: 'BSc', institution: 'Uni'}]} // Ensure education is present
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      );

      // Initially "Yes" should be selected due to initialExperiences
      expect(screen.getByText('Old Job')).toBeInTheDocument();
      const noButton = screen.getByRole('button', { name: 'No' });
      fireEvent.click(noButton);

      expect(screen.getByRole('button', { name: 'No' })).toHaveClass('bg-blue-600');
      expect(screen.queryByPlaceholderText(/Software Engineer/i)).not.toBeInTheDocument(); // Job title input
      expect(screen.getByText(/No work experience will be added/i)).toBeInTheDocument();
      expect(screen.queryByText('Old Job')).not.toBeInTheDocument(); // Old job should be cleared

      fireEvent.click(screen.getByRole('button', { name: /Submit Application/i }));
      expect(mockOnSubmit).toHaveBeenCalledWith([], expect.any(Array)); // Experiences should be empty
    });

    test('selecting "Yes" shows form and allows adding/removing experiences', () => {
      render(
        <ExperiencePage
          initialExperiences={[]}
          initialEducation={[{degree: 'BSc', institution: 'Uni'}]} // Ensure education for submit
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      );

      const yesButton = screen.getByRole('button', { name: 'Yes' });
      fireEvent.click(yesButton);

      expect(screen.getByRole('button', { name: 'Yes' })).toHaveClass('bg-blue-600');
      const jobTitleInput = screen.getByPlaceholderText(/Software Engineer/i);
      const companyInput = screen.getByPlaceholderText(/Company Name/i);
      const startDateInput = screen.getAllByPlaceholderText(/MM\/YYYY/i)[1]; // Second MM/YYYY is for exp start date
      const descriptionInput = screen.getByPlaceholderText(/Brief description/i);
      const addExperienceButton = screen.getByRole('button', { name: /Add Experience/i });

      expect(jobTitleInput).toBeInTheDocument();
      expect(addExperienceButton).toBeDisabled();

      // Add experience
      fireEvent.change(jobTitleInput, { target: { value: 'Software Developer' } });
      fireEvent.change(companyInput, { target: { value: 'Innovate Ltd.' } });
      fireEvent.change(startDateInput, { target: { value: '01/2023' } });
      fireEvent.change(descriptionInput, { target: { value: 'Developed cool stuff.' } });
      expect(addExperienceButton).toBeEnabled();
      fireEvent.click(addExperienceButton);

      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.getByText('Innovate Ltd.')).toBeInTheDocument();
      expect(screen.getByText('01/2023 - N/A')).toBeInTheDocument(); // Assuming end date is optional
      expect(screen.getByText('Developed cool stuff.')).toBeInTheDocument();
      expect(jobTitleInput).toHaveValue(''); // Form cleared

      // Remove experience
      const experienceEntries = screen.getAllByText(/Innovate Ltd./i).map(el => el.closest('div.bg-gray-50') as HTMLElement);
      const removeButton = within(experienceEntries[0]).getByRole('button');
      fireEvent.click(removeButton);

      expect(screen.queryByText('Software Developer')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission and Navigation', () => {
    test('calls onSubmit with correct data when form is valid', () => {
      render(
        <ExperiencePage
          initialExperiences={[]}
          initialEducation={[]}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      );

      // Add education
      fireEvent.change(screen.getByPlaceholderText(/Bachelor of Science/i), { target: { value: 'BSc Test' } });
      fireEvent.change(screen.getByPlaceholderText(/University Name/i), { target: { value: 'Test University' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Education/i }));

      // Select "Yes" for experience and add one
      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
      fireEvent.change(screen.getByPlaceholderText(/Software Engineer/i), { target: { value: 'Tester' } });
      fireEvent.change(screen.getByPlaceholderText(/Company Name/i), { target: { value: 'QA Corp' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Experience/i }));

      expect(screen.getByRole('button', { name: /Submit Application/i })).toBeEnabled();
      fireEvent.click(screen.getByRole('button', { name: /Submit Application/i }));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        [{ jobTitle: 'Tester', company: 'QA Corp', startDate: '', endDate: '', description: '' }],
        [{ degree: 'BSc Test', institution: 'Test University', graduationDate: '' }]
      );
    });

    test('shows alert and does not submit if education is missing', () => {
      render(
        <ExperiencePage
          initialExperiences={[]}
          initialEducation={[]}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      );
      // Choose "No" for experience, so only education is the factor
      fireEvent.click(screen.getByRole('button', { name: 'No' }));

      expect(screen.getByRole('button', { name: /Submit Application/i })).toBeDisabled();
      expect(alertMock).not.toHaveBeenCalled();
    });

    test('Submit button is disabled if work experience choice is not made', () => {
        render(
            <ExperiencePage
              initialExperiences={[]}
              initialEducation={[{degree: 'BSc', institution: 'Uni'}]} // Education is present
              onSubmit={mockOnSubmit}
              onBack={mockOnBack}
            />
          );
          expect(screen.getByRole('button', { name: /Submit Application/i })).toBeDisabled();
          expect(screen.getByText(/Please select whether you have work experience./i)).toBeInTheDocument();
    });


    test('calls onBack when "Back" button is clicked', () => {
      render(
        <ExperiencePage
          initialExperiences={[]}
          initialEducation={[]}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Back/i }));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });
});
// SkillsPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, within, queryByRole } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkillsPage from './SkillsPage'; // Adjust path if necessary

const mockOnSubmit = jest.fn();
const mockOnBack = jest.fn();

const suggestedSkills: string[] = [ // Explicitly type if not inferred correctly elsewhere
  'React', 'TypeScript', 'CSS', 'Python', 'Java', 'SQL', 'C#', 'Docker', 'AWS', 'Git',
  'Node.js', 'HTML', 'JavaScript', 'Angular', 'Vue', 'PHP', 'Ruby', 'Go', 'Rust',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redux', 'GraphQL', 'REST API'
];

// Helper function to find active skill containers for a given skill name
// Returns an array of HTMLDivElement that are considered "active skill containers"
const getActiveSkillContainers = (skillName: string): HTMLDivElement[] => {
  return screen.queryAllByText(skillName) // Returns HTMLElement[] matching the text
    .map((textMatchElement: HTMLElement) =>
      // For each text match, find its closest ancestor div with the specified class
      textMatchElement.closest<HTMLDivElement>('div.bg-blue-100')
    )
    .filter((container): container is HTMLDivElement => {
      // Filter out nulls (if no such ancestor was found)
      // And ensure the container indeed has the '×' remove button, defining it as an active skill structure
      return container !== null && within(container).queryByRole('button', { name: '×' }) !== null;
    });
};


describe('SkillsPage', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnBack.mockClear();
  });

  test('renders initial state correctly with no initial skills or location', () => {
    render(<SkillsPage initialSkills={[]} initialLocation="" onSubmit={mockOnSubmit} onBack={mockOnBack} />);

    expect(screen.getByText('Add Your Skills')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter a skill (e.g., JavaScript, Project Management)')).toBeInTheDocument();
    expect(screen.getByLabelText('Preferred Location (Optional)')).toHaveValue('');
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
    expect(screen.getByText('Suggested skills:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: suggestedSkills[0] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: suggestedSkills[1] })).toBeInTheDocument();
  });

  test('renders with initial skills and location', () => {
    const initialSkills = ['React', 'Node.js'];
    const initialLocation = 'Remote';
    render(
      <SkillsPage
        initialSkills={initialSkills}
        initialLocation={initialLocation}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    const activeReactContainers = getActiveSkillContainers('React');
    expect(activeReactContainers.length).toBe(1);
    // If the above assertion passes, activeReactContainers[0] is safe to access
    expect(within(activeReactContainers[0]).getByText('React')).toBeInTheDocument();

    const activeNodeContainers = getActiveSkillContainers('Node.js');
    expect(activeNodeContainers.length).toBe(1);
    expect(within(activeNodeContainers[0]).getByText('Node.js')).toBeInTheDocument();

    expect(screen.getByLabelText('Preferred Location (Optional)')).toHaveValue(initialLocation);
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  test('allows adding a skill via input and "Add" button', () => {
    render(<SkillsPage initialSkills={[]} onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    const skillInput = screen.getByPlaceholderText(/Enter a skill/i);
    const addButton = screen.getByRole('button', { name: '+' });

    fireEvent.change(skillInput, { target: { value: 'Jest' } });
    fireEvent.click(addButton);

    const activeJestContainers = getActiveSkillContainers('Jest');
    expect(activeJestContainers.length).toBe(1);
    expect(within(activeJestContainers[0]).getByText('Jest')).toBeInTheDocument();
    expect(skillInput).toHaveValue('');
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  test('allows adding a skill via input and pressing Enter', () => {
    render(<SkillsPage initialSkills={[]} onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    const skillInput = screen.getByPlaceholderText(/Enter a skill/i);

    fireEvent.change(skillInput, { target: { value: 'Testing Library' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });

    const activeTLContainers = getActiveSkillContainers('Testing Library');
    expect(activeTLContainers.length).toBe(1);
    expect(within(activeTLContainers[0]).getByText('Testing Library')).toBeInTheDocument();
    expect(skillInput).toHaveValue('');
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  test('allows adding a skill by clicking a suggested skill', () => {
    render(<SkillsPage initialSkills={[]} onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    const skillToAdd = suggestedSkills[0];
    const suggestedSkillButton = screen.getByRole('button', { name: skillToAdd });

    fireEvent.click(suggestedSkillButton);

    const activeSkillContainers = getActiveSkillContainers(skillToAdd);
    expect(activeSkillContainers.length).toBe(1);
    expect(within(activeSkillContainers[0]).getByText(skillToAdd)).toBeInTheDocument();
    
    expect(screen.queryByRole('button', { name: skillToAdd })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  test('does not add an empty or duplicate skill', () => {
    render(<SkillsPage initialSkills={['React']} onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    const skillInput = screen.getByPlaceholderText(/Enter a skill/i);
    const addButton = screen.getByRole('button', { name: '+' });

    fireEvent.change(skillInput, { target: { value: '   ' } });
    fireEvent.click(addButton);
    expect(getActiveSkillContainers('React').length).toBe(1);

    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.click(addButton);
    expect(getActiveSkillContainers('React').length).toBe(1);
  });

  test('allows removing a skill, and it returns to suggested if applicable', () => {
    const initialTestSkills = ['TypeScript', 'CSS'];
    render(
      <SkillsPage
        initialSkills={initialTestSkills}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    // --- Test removing 'TypeScript' ---
    let activeTypeScriptContainers = getActiveSkillContainers('TypeScript');
    expect(activeTypeScriptContainers.length).toBe(1);

    if (suggestedSkills.includes('TypeScript')) {
      expect(screen.queryByRole('button', { name: 'TypeScript' })).not.toBeInTheDocument();
    }

    const removeTypeScriptButton = within(activeTypeScriptContainers[0]).getByRole('button', { name: '×' });
    fireEvent.click(removeTypeScriptButton);

    activeTypeScriptContainers = getActiveSkillContainers('TypeScript');
    expect(activeTypeScriptContainers).toHaveLength(0);

    if (suggestedSkills.includes('TypeScript')) {
      expect(screen.getByRole('button', { name: 'TypeScript' })).toBeInTheDocument();
    }

    // --- Test 'CSS' state after 'TypeScript' removal ---
    let activeCssContainers = getActiveSkillContainers('CSS');
    expect(activeCssContainers.length).toBe(1); // CSS should still be active
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();

    // --- Test removing 'CSS' (the last skill) ---
    if (suggestedSkills.includes('CSS')) {
      expect(screen.queryByRole('button', { name: 'CSS' })).not.toBeInTheDocument();
    }

    const removeCssButton = within(activeCssContainers[0]).getByRole('button', { name: '×' });
    fireEvent.click(removeCssButton);

    activeCssContainers = getActiveSkillContainers('CSS');
    expect(activeCssContainers).toHaveLength(0);

    if (suggestedSkills.includes('CSS')) {
      expect(screen.getByRole('button', { name: 'CSS' })).toBeInTheDocument();
    }
    
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  test('updates location field', () => {
    render(<SkillsPage initialSkills={['TestSkill']} onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    const locationInput = screen.getByLabelText('Preferred Location (Optional)');

    fireEvent.change(locationInput, { target: { value: 'New York' } });
    expect(locationInput).toHaveValue('New York');
  });

  test('calls onSubmit with skills and location when "Continue" is clicked', () => {
    render(<SkillsPage initialSkills={[]} initialLocation="" onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    const skillInput = screen.getByPlaceholderText(/Enter a skill/i);
    const locationInput = screen.getByLabelText('Preferred Location (Optional)');
    const continueButton = screen.getByRole('button', { name: /Continue/i });

    fireEvent.change(skillInput, { target: { value: 'Python' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });
    fireEvent.change(locationInput, { target: { value: 'London' } });

    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(['Python'], 'London');
  });

  test('"Continue" button is disabled if no skills are added', () => {
    render(<SkillsPage initialSkills={[]} onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  test('calls onBack when "Back" button is clicked', () => {
    render(<SkillsPage initialSkills={['Anything']} onSubmit={mockOnSubmit} onBack={mockOnBack} />);
    const backButton = screen.getByRole('button', { name: /Back/i });

    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
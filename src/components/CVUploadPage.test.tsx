// CVUploadPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CVUploadPage from './CVUploadPage'; // Adjust path if necessary

// Mock the onUpload function
const mockOnUpload = jest.fn();

describe('CVUploadPage', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockOnUpload.mockClear();
  });

  test('renders initial state correctly', () => {
    render(<CVUploadPage onUpload={mockOnUpload} />);

    expect(screen.getByText('Upload your CV')).toBeInTheDocument(); // CVUploadPage.tsx
    expect(screen.getByText(/Start by uploading your CV/i)).toBeInTheDocument(); // CVUploadPage.tsx
    expect(screen.getByText(/Drag and drop your CV here, or click to browse/i)).toBeInTheDocument(); // CVUploadPage.tsx
    expect(screen.getByText(/Supports PDF, DOC, DOCX up to 5MB/i)).toBeInTheDocument(); // CVUploadPage.tsx
    
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled(); // CVUploadPage.tsx
  });

  test('allows file selection via click and updates UI', async () => {
    render(<CVUploadPage onUpload={mockOnUpload} />);

    const fileInput = screen.getByTestId('file-input-cv'); // Add data-testid="file-input-cv" to your input in CVUploadPage.tsx
    const dropzone = screen.getByText(/Drag and drop your CV here/i);

    // Mock file
    const file = new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' });

    // Simulate user clicking the dropzone to open file dialog
    fireEvent.click(dropzone);
    
    // Simulate file selection
    // In CVUploadPage.tsx, add data-testid="file-input-cv" to the <input type="file" ... />
    // e.g. <input data-testid="file-input-cv" type="file" ... />
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('chucknorris.pdf')).toBeInTheDocument(); // CVUploadPage.tsx
    });
    expect(screen.getByText(/0.00 MB/i)).toBeInTheDocument(); // CVUploadPage.tsx
    expect(screen.getByTestId('lucide-x')).toBeInTheDocument(); // Mocked X icon

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).toBeEnabled(); // CVUploadPage.tsx
  });

  test('allows file removal', async () => {
    render(<CVUploadPage onUpload={mockOnUpload} />);
    const fileInput = screen.getByTestId('file-input-cv'); // Add data-testid
    const dropzone = screen.getByText(/Drag and drop your CV here/i);
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });

    // Select file
    fireEvent.click(dropzone);
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('resume.pdf')).toBeInTheDocument(); // CVUploadPage.tsx
    });

    // Remove file
    const removeButton = screen.getByTestId('lucide-x');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('resume.pdf')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Drag and drop your CV here/i)).toBeInTheDocument(); // CVUploadPage.tsx
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled(); // CVUploadPage.tsx
  });

  test('handles drag and drop', async () => {
    render(<CVUploadPage onUpload={mockOnUpload} />);
    const dropzone = screen.getByText(/Drag and drop your CV here/i).closest('div')!; // CVUploadPage.tsx

    const file = new File(['cv content'], 'mycv.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    fireEvent.dragOver(dropzone, {
      dataTransfer: { files: [file] },
    });
    // You might need to check for class changes or style changes if isDragging has visual effects
    // For example: expect(dropzone).toHaveClass('border-blue-500');

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('mycv.docx')).toBeInTheDocument(); // CVUploadPage.tsx
    });
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled(); // CVUploadPage.tsx
  });
  
  test('calls onUpload with the selected file when "Continue" is clicked', async () => {
    render(<CVUploadPage onUpload={mockOnUpload} />);
    const fileInput = screen.getByTestId('file-input-cv'); // Add data-testid
    const dropzone = screen.getByText(/Drag and drop your CV here/i);
    const file = new File(['my cv'], 'test.pdf', { type: 'application/pdf' });

    // Select file
    fireEvent.click(dropzone);
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled(); // CVUploadPage.tsx
    });
    
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    expect(mockOnUpload).toHaveBeenCalledTimes(1);
    expect(mockOnUpload).toHaveBeenCalledWith(file);
  });

   test('does not call onUpload if no file is selected and "Continue" is somehow clicked', () => {
    render(<CVUploadPage onUpload={mockOnUpload} />);
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    
    // Button should be disabled, but let's ensure onUpload isn't called if it were clicked
    expect(continueButton).toBeDisabled(); // CVUploadPage.tsx
    fireEvent.click(continueButton); // Simulate click even if disabled for robustness
    
    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  test('drag leave resets dragging state', () => {
    render(<CVUploadPage onUpload={mockOnUpload} />);
    const dropzoneContainer = screen.getByText(/Drag and drop your CV here/i).closest('div')!; // CVUploadPage.tsx

    fireEvent.dragOver(dropzoneContainer, {
      dataTransfer: { files: [new File([''], 'dummy.pdf')] },
    });
    // Assuming 'border-blue-500' is added when isDragging is true
    // You might need to inspect the actual class names from your component
    expect(dropzoneContainer).toHaveClass('border-blue-500'); // CVUploadPage.tsx

    fireEvent.dragLeave(dropzoneContainer);
    expect(dropzoneContainer).not.toHaveClass('border-blue-500'); // CVUploadPage.tsx
    expect(dropzoneContainer).toHaveClass('border-gray-300'); // CVUploadPage.tsx
  });
});
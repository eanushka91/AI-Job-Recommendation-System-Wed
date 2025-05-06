import React, { useState, useRef } from 'react';

interface CVUploadPageProps {
  onUpload: (file: File) => void;
}

const CVUploadPage: React.FC<CVUploadPageProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Upload your CV</h2>
      <p className="text-gray-600 mb-6">Start by uploading your CV to help us find the best job matches for you</p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${selectedFile ? 'bg-green-50 border-green-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />
        
        {selectedFile ? (
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2 1h8v10H6V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <button 
              type="button"
              className="mt-4 text-sm text-red-600 hover:text-red-800"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
            <p className="font-medium">Drag and drop your CV here, or click to browse</p>
            <p className="text-sm text-gray-500 mt-1">Supports PDF, DOC, DOCX up to 5MB</p>
          </>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          className={`px-6 py-2 rounded-md text-white font-medium ${
            selectedFile 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!selectedFile}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CVUploadPage;
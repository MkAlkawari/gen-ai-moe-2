import React, { useState } from 'react';
import { Nav } from '../components/Nav'; // Correct import for Nav
import DropzoneAudio from '../components/DropzoneAudio';
import DropzoneListeningQfiles from '../components/DropzoneListeningQfiles';
import '../components/AdminStyle/Upload.css';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import { Link } from 'react-router-dom'; // Import Link for navigation

interface UploadListeningProps {
  hideLayout?: boolean; // Adding the hideLayout prop
}

const UploadListening = ({ hideLayout }: UploadListeningProps) => {
  const navLinks = [
    { text: 'Home', to: '/' },
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
    { text: 'Top achievers', to: '/studentperformance' },
  ];

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // Track if form is submitted

  // Callback to collect the audio file from DropzoneAudio
  const handleAudioFile = (file: File | null) => setAudioFile(file);

  // Callback to collect the question file from Dropzone
  const handleQuestionFile = (file: File | null) => setQuestionFile(file);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    try {
      const section = 'Listening';
      // Prepare the form data for audio file
      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);

        await toJSON(
          post({
            apiName: 'myAPI',
            path: `/adminUploadAudio?section=${encodeURIComponent(section)}`,
            options: { body: audioFormData },
          }),
        );
      }

      // Prepare the form data for question file
      if (questionFile) {
        const questionFormData = new FormData();
        questionFormData.append('file', questionFile);

        await toJSON(
          post({
            apiName: 'myAPI',
            path: `/adminUpload?section=${encodeURIComponent(section)}`,
            options: { body: questionFormData },
          }),
        );
      }

      setUploadStatus('Upload successfully!');
      setIsSubmitted(true); // Mark the form as submitted
    } catch (error) {
      setUploadStatus(`Upload failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="upload-page">
      {/* Use Nav component here */}
      {!hideLayout && <Nav entries={navLinks} />}
      {/* Conditionally render Nav based on hideLayout */}
      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Listening Files</h1>
          <p className="page-description">
            Upload your audio files and question files.
          </p>

          {/* Dropzone for Audio Files */}
          <h2 className="subtitle">Audio Files</h2>
          <DropzoneAudio
            className="dropzone-container"
            onFileSelected={handleAudioFile} // Pass callback
          />

          {/* Dropzone for Question Files */}
          <h2 className="subtitle">Question Files</h2>
          <DropzoneListeningQfiles
            className="dropzone-container"
            acceptedFileTypes={{
              'application/pdf': [], // .pdf files
            }}
            onFileSelected={handleQuestionFile} // Pass callback
          />

          <div className="button-container">
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
            <Link to="/showExtractedListening">
              <button
                className="extract-btn"
                disabled={!isSubmitted} // Disable until submit is clicked
              >
                Extract
              </button>
            </Link>
          </div>

          {uploadStatus && (
            <p
              className={`upload-status ${
                uploadStatus.startsWith('Upload successfully')
                  ? 'success'
                  : 'error'
              }`}
            >
              {uploadStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadListening;

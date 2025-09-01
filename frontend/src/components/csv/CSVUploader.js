import React, { useState, useCallback } from 'react';
import Button from '../common/Button';

const CSVUploader = ({ onUpload, isUploading = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    setError('');

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));

    if (!csvFile) {
      setError('Please upload a CSV file');
      return;
    }

    handleFileUpload(csvFile);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setError('');
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/question-sets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      onUpload(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="csv-uploader">
      <div
        className={`csv-upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csv-file-input').click()}
      >
        <div className="upload-icon">📄</div>
        <h3 className="text-lg font-semibold mb-2">Upload CSV Question File</h3>
        <p className="text-muted mb-4">
          Drag and drop your CSV file here, or click to browse
        </p>
        <p className="text-sm text-muted mb-4">
          Required format: question, answer, category (optional), difficulty (optional)
        </p>
        <Button 
          variant="primary" 
          disabled={isUploading}
          className="touch-target"
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </Button>
      </div>

      <input
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {error && (
        <div className="error-message mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="csv-format-help mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold mb-2">CSV Format Example:</h4>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`question,answer,category,difficulty
"What is the capital of Argentina?","Buenos Aires","Geography","Easy"
"What are the 12 biggest cities in Argentina?","Buenos Aires, Córdoba, Rosario, Mendoza, Tucumán, La Plata, Mar del Plata, Salta, Santa Fe, San Juan, Resistencia, Neuquén","Geography","Medium"
"What are the 10 largest fast food chains in France?","McDonald's, KFC, Quick, Subway, Burger King, Domino's Pizza, Pizza Hut, Flunch, La Croissanterie, Paul","Business","Medium"`}
        </pre>
      </div>
    </div>
  );
};

export default CSVUploader;
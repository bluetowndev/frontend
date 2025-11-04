import React, { useState } from 'react';
import { useUserAchievements } from '../../hooks/useUserAchievements';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ExcelAchievementUpload = () => {
  const { bulkImportAchievements, isLoading } = useUserAchievements();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Handle file processing
  const handleFile = (file) => {
    if (!file) return;

    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error('Please upload a valid Excel file (.xlsx, .xls, or .csv)');
      return;
    }

    setUploadedFile(file);
    parseExcelFile(file);
  };

  // Parse Excel file
  const parseExcelFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          toast.error('Excel file must contain at least a header row and one data row');
          return;
        }

        const achievements = convertExcelToAchievements(jsonData);
        if (achievements.length > 0) {
          setPreviewData(achievements);
          toast.success(`Successfully parsed ${achievements.length} achievement records`);
        } else {
          toast.error('No valid achievement data found in the Excel file');
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Error parsing Excel file. Please check the format.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Convert Excel data to achievement format
  const convertExcelToAchievements = (jsonData) => {
    if (jsonData.length < 2) return [];

    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);
    
    // Find column indices
    const emailIndex = headers.findIndex(header => 
      header && (
        header.toString().toLowerCase().includes('engineer') || 
        header.toString().toLowerCase().includes('email') ||
        header.toString().toLowerCase().includes('field')
      )
    );
    
    const sepIndex = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes('sep')
    );
    
    const octIndex = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes('oct')
    );
    
    const novIndex = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes('nov')
    );

    if (emailIndex === -1) {
      console.log('Available headers:', headers);
      toast.error(`Email column not found. Available headers: ${headers.join(', ')}. Please ensure the first column contains "Field Engineer" or similar.`);
      return [];
    }

    if (sepIndex === -1 && octIndex === -1 && novIndex === -1) {
      console.log('Available headers:', headers);
      toast.error(`No achievement columns found. Available headers: ${headers.join(', ')}. Please ensure there are columns for September, October, or November achievements.`);
      return [];
    }

    const achievements = [];

    dataRows.forEach((row, index) => {
      if (row.length === 0) return; // Skip empty rows

      const email = row[emailIndex];
      const september2025 = sepIndex !== -1 ? row[sepIndex] : null;
      const october2025 = octIndex !== -1 ? row[octIndex] : null;
      const november2025 = novIndex !== -1 ? row[novIndex] : null;

      if (!email || email.toString().trim() === '') {
        console.warn(`Row ${index + 2}: No email found, skipping`);
        return;
      }

      const achievement = { email: email.toString().trim() };
      
      if (september2025 !== undefined && september2025 !== null && september2025 !== '') {
        achievement.september2025 = parseFloat(september2025) || 0;
      }
      
      if (october2025 !== undefined && october2025 !== null && october2025 !== '') {
        achievement.october2025 = parseFloat(october2025) || 0;
      }
      
      if (november2025 !== undefined && november2025 !== null && november2025 !== '') {
        achievement.november2025 = parseFloat(november2025) || 0;
      }

      // Only add if at least one achievement is present
      if (achievement.september2025 !== undefined || achievement.october2025 !== undefined || achievement.november2025 !== undefined) {
        achievements.push(achievement);
      }
    });

    return achievements;
  };

  // Upload achievements to server
  const handleUpload = async () => {
    if (!previewData || previewData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    // Check if user is authenticated
    let token = localStorage.getItem('token');
    
    // If token is not found directly, check if it's stored as part of an object
    if (!token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        token = userData.token;
      } catch (error) {
        console.log('Error parsing user data:', error);
      }
    }
    
    console.log('Token check:', { token, exists: !!token, length: token?.length });
    
    if (!token) {
      toast.error('Please login again to upload achievements');
      console.log('No token found, redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    setUploading(true);
    
    try {
      const response = await bulkImportAchievements(previewData);
      
      if (response.success) {
        toast.success(`Successfully imported ${response.results.length} achievements`);
        
        if (response.errors && response.errors.length > 0) {
          toast.error(`${response.errors.length} records failed to import`);
          console.log('Import errors:', response.errors);
          
          // Show detailed error information
          const errorDetails = response.errors.map(err => `${err.email}: ${err.error}`).join('\n');
          toast.error(`Failed uploads:\n${errorDetails}`, { duration: 10000 });
        }
        
        // Reset form
        setUploadedFile(null);
        setPreviewData(null);
        setUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload achievements: ${error.message}`);
      setUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setUploadedFile(null);
    setPreviewData(null);
    setDragActive(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">🏆</span>
        </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Achievement Upload</h2>
            <p className="text-sm text-gray-600">Upload September, October, and November achievements for field engineers</p>
          </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploadedFile ? uploadedFile.name : 'Drop your Excel file here'}
            </p>
            <p className="text-sm text-gray-600">
              or <span className="text-green-600 font-medium">click to browse</span>
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Supported formats: .xlsx, .xls, .csv</p>
            <p>Expected format: Field Engineer | September | October | November Achievement</p>
          </div>
        </div>
      </div>

      {/* Preview Data */}
      {previewData && previewData.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Preview Data ({previewData.length} records)
            </h3>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {previewData.slice(0, 10).map((achievement, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <span className="text-sm font-medium text-gray-900">
                    {achievement.email}
                  </span>
                  <div className="flex items-center space-x-3">
                    {achievement.september2025 !== undefined && (
                      <span className="text-sm text-green-600 font-medium">
                        Sep: {achievement.september2025}
                      </span>
                    )}
                    {achievement.october2025 !== undefined && (
                      <span className="text-sm text-green-600 font-medium">
                        Oct: {achievement.october2025}
                      </span>
                    )}
                    {achievement.november2025 !== undefined && (
                      <span className="text-sm text-green-600 font-medium">
                        Nov: {achievement.november2025}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {previewData.length > 10 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  ... and {previewData.length - 10} more records
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {previewData && previewData.length > 0 && (
        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={uploading || isLoading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading || isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              `Upload ${previewData.length} Achievements`
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Excel Format Requirements:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• First column: Field Engineer (Email addresses)</li>
          <li>• Columns: September, October, November Achievement (Numeric values)</li>
          <li>• First row should contain headers</li>
          <li>• Data should start from the second row</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelAchievementUpload;
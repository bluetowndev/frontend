import React, { useState } from 'react';
import { useUserTargets } from '../../hooks/useUserTargets';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ExcelTargetUpload = () => {
  const { bulkImportTargets, isLoading } = useUserTargets();
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

  // Process uploaded file
  const handleFile = (file) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
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

        // Validate and convert data
        const convertedData = convertExcelToTargets(jsonData);
        setPreviewData(convertedData);
        
        if (convertedData.length === 0) {
          toast.error('No valid data found in the Excel file');
        } else {
          toast.success(`Found ${convertedData.length} valid records`);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Error parsing Excel file. Please check the format.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Convert Excel data to target format
  const convertExcelToTargets = (jsonData) => {
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

    const targets = [];
    
    dataRows.forEach((row, index) => {
      if (row[emailIndex] && row[emailIndex].toString().trim()) {
        const email = row[emailIndex].toString().trim();
        
        // Validate email format
        if (!email.includes('@')) {
          console.warn(`Invalid email format at row ${index + 2}: ${email}`);
          return;
        }

        const target = {
          email,
          september2025: sepIndex !== -1 && row[sepIndex] ? parseFloat(row[sepIndex]) || 0 : 0,
          october2025: octIndex !== -1 && row[octIndex] ? parseFloat(row[octIndex]) || 0 : 0,
          november2025: novIndex !== -1 && row[novIndex] ? parseFloat(row[novIndex]) || 0 : 0
        };

        targets.push(target);
      }
    });

    return targets;
  };

  // Upload targets to server
  const handleUpload = async () => {
    if (!previewData || previewData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    setUploading(true);
    
    try {
      const response = await bulkImportTargets(previewData);
      
      if (response.success) {
        toast.success(`Successfully imported ${response.results.length} targets`);
        
        if (response.errors && response.errors.length > 0) {
          toast.error(`${response.errors.length} records failed to import`);
          console.log('Import errors:', response.errors);
        }
        
        // Reset form
        setUploadedFile(null);
        setPreviewData(null);
        setUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload targets');
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
          <span className="text-white text-xl">📊</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Upload Target Excel</h2>
          <p className="text-sm text-gray-500">Import monthly targets from Excel file</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!uploadedFile ? (
          <div>
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Drop your Excel file here
            </h3>
            <p className="text-gray-500 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose File
            </label>
            <div className="mt-4 text-sm text-gray-500">
              <p>Expected format:</p>
              <p>• Column 1: Field Engineer (Email)</p>
              <p>• Column 2: Target Sep'25</p>
              <p>• Column 3: Target Oct'25</p>
              <p>• Column 4: Target Nov'25</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              File Ready: {uploadedFile.name}
            </h3>
            <p className="text-gray-500 mb-4">
              {previewData ? `${previewData.length} records found` : 'Processing...'}
            </p>
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              Choose Different File
            </button>
          </div>
        )}
      </div>

      {/* Preview Data */}
      {previewData && previewData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Preview Data ({previewData.length} records)
          </h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Sep 2025</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Oct 2025</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Nov 2025</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((target, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-600">{target.email}</td>
                    <td className="px-3 py-2 text-gray-600">{target.september2025}</td>
                    <td className="px-3 py-2 text-gray-600">{target.october2025}</td>
                    <td className="px-3 py-2 text-gray-600">{target.november2025}</td>
                  </tr>
                ))}
                {previewData.length > 10 && (
                  <tr>
                    <td colSpan="4" className="px-3 py-2 text-center text-gray-500">
                      ... and {previewData.length - 10} more records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {previewData && previewData.length > 0 && (
        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={uploading || isLoading}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : `Upload ${previewData.length} Targets`}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure the first column contains email addresses</li>
          <li>• Column headers should include "Sep", "Oct", "Nov" for 2025 targets</li>
          <li>• Target values should be numeric</li>
          <li>• Users must exist in the system for targets to be assigned</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelTargetUpload;

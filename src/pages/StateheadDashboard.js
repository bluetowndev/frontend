import React, { useState, useEffect, useCallback } from "react";
import WorldMapStateHead from "../components/StateHead/WorldMapStateHead";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { format, addDays, startOfMonth } from 'date-fns';

const apiUrl = process.env.REACT_APP_API_URL || '';

const statesAndUTs = [
  "Bihar", "Himachal Pradesh", "Jharkhand", "Madhya Pradesh", "Rajasthan", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const engineers = ["Engineer A", "Engineer B", "Engineer C"]; // Sample engineers

const StateheadDashboard = () => {
  const [selectedState, setSelectedState] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [currentViewIndex, setCurrentViewIndex] = useState(0); // To track which columns are being viewed

  const handleStateChange = (e) => setSelectedState(e.target.value);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const handlePurposeChange = (e) => setSelectedPurpose(e.target.value);

  // Function to fetch the attendance data
  const fetchAttendanceData = useCallback(async () => {
    if (selectedState && startDate) {
      const startInIST = new Date(startDate);
      startInIST.setMinutes(startInIST.getMinutes() + 330); // Convert to IST

      const endInIST = endDate ? new Date(endDate) : new Date(startInIST);
      endInIST.setMinutes(endInIST.getMinutes() + 330); // Convert to IST

      const user = JSON.parse(localStorage.getItem('user')); // Get user from local storage
      const token = user ? user.token : null; // Extract token from user object

      if (!token) {
        toast.error('No token found');
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/attendance/filtered?state=${selectedState}&startDate=${startInIST.toISOString().split('T')[0]}&endDate=${endInIST.toISOString().split('T')[0]}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        const data = await response.json();

        if (response.ok) {
          setAttendanceData(data);
          toast.success('Attendance data fetched successfully');
        } else {
          console.error('Failed to fetch attendance data:', data.error);
          toast.error('Failed to fetch attendance data');
        }
      } catch (error) {
        console.error('An error occurred:', error);
        toast.error('An error occurred while fetching attendance data');
      }
    }
  }, [selectedState, startDate, endDate]);

  const convertToIST = (dateString) => {
    const date = new Date(dateString);
    const offset = 330; // IST offset in minutes
    date.setMinutes(date.getMinutes() + offset);
    return date.toISOString().replace('T', ' ').substring(0, 19); // Format as YYYY-MM-DD HH:mm:ss
  };

  const downloadExcel = (data, fileName) => {
    if (data.length === 0) {
      toast.error("No data to download");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data.map(att => ({
      'Email': att.user.email,
      'Name': att.user.fullName,
      'Mobile Number': att.user.phoneNumber,
      'Login details': convertToIST(att.timestamp),
      'Location Latitude': att.location.lat,
      'Location Longitude': att.location.lng,
      'Location Name': att.locationName,
      'Purpose': att.purpose,
      'Feedback': att.feedback,
      'Reporting Manager': att.user.reportingManager,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');

    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast.success(`${fileName} downloaded successfully`);
  };

  useEffect(() => {
    if (selectedState && startDate) {
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, selectedState, startDate, endDate]);

  // Function to get all dates from the start of the month to today's date
  const getDatesTillToday = () => {
    const dates = [];
    const today = new Date(); // Get today's date
    let currentDate = startOfMonth(today); // Start from the first day of the month
    while (currentDate <= today) {
      dates.push(format(currentDate, "yyyy-MM-dd"));
      currentDate = addDays(currentDate, 1); // Move to the next day
    }
    return dates;
  };

  // Get today's date dynamically
  const today = new Date();

  // Function to handle the previous 5-day view
  const handlePrevious = () => {
    if (currentViewIndex > 0) {
      setCurrentViewIndex(currentViewIndex - 5);
    } else {
      toast.error("No more previous dates");
    }
  };

  // Function to handle the next 5-day view
  const handleNext = () => {
    const totalColumns = getDatesTillToday().length;
    if (currentViewIndex + 5 < totalColumns) {
      setCurrentViewIndex(currentViewIndex + 5);
    } else {
      toast.error("No more dates to show");
    }
  };

  // Get the current 5-day window to display
  const visibleDates = getDatesTillToday().slice(currentViewIndex, currentViewIndex + 5);

  return (
    <div className="flex flex-col p-4">
      <div className="mb-5 w-full">
        {/* Filter and date picker UI */}
      </div>

      <div className="flex flex-col md:flex-row md:mx-5 space-y-5 md:space-y-0 md:space-x-5 flex-grow">
        <div className="md:w-1/3 lg:w-2/3 w-full mb-2 space-y-4">
          <div className="flex flex-col space-y-4">
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="p-2 border rounded"
            >
              <option value="">Select State/UT</option>
              {statesAndUTs.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <div className="flex flex-col space-y-2">
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                dateFormat="yyyy-MM-dd"
                className="p-2 border rounded w-full"
                placeholderText="Select Start Date"
              />
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                dateFormat="yyyy-MM-dd"
                className="p-2 border rounded w-full"
                placeholderText="Select End Date"
              />
            </div>
            <button
              onClick={() => downloadExcel(attendanceData, 'attendance_data')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300 w-full"
            >
              Download State Data
            </button>
          </div>
        </div>
        <div className="md:w-2/3 lg:w-1/3 w-full">
          <WorldMapStateHead />
        </div>
      </div>

      {/* Second Dropdown */}
      <select
        value={selectedPurpose}
        onChange={handlePurposeChange}
        className="p-2 border rounded"
      >
        <option value="">Select Purpose</option>
        <option value="Purpose 1">Purpose 1</option>
        <option value="Purpose 2">Purpose 2</option>
        <option value="Purpose 3">Purpose 3</option>
      </select>

      {/* Site Count Table with Engineers as rows and Dates as columns */}
      <div className="mt-8">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '300px' }}>
          <div className="flex justify-between items-center mb-2">
            <button onClick={handlePrevious} className="px-4 py-2 bg-gray-300 rounded">
              &larr; Previous
            </button>
            <button onClick={handleNext} className="px-4 py-2 bg-gray-300 rounded">
              Next &rarr;
            </button>
          </div>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-gray-200 border-b">Engineers</th>
                {visibleDates.map((date, index) => (
                  <th key={index} className="py-2 px-4 bg-gray-200 border-b">{date}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engineers.map((engineer, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{engineer}</td>
                  {visibleDates.map((date, i) => (
                    <td key={i} className="py-2 px-4 border-b">{attendanceData[engineer]?.[date] || 'N/A'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StateheadDashboard;

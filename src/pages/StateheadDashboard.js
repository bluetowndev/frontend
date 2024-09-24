import React, { useState, useEffect, useCallback } from "react";
import WorldMapStateHead from "../components/StateHead/WorldMapStateHead";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
//import { format, addDays, startOfMonth } from 'date-fns';

const apiUrl = process.env.REACT_APP_API_URL || '';

const statesAndUTs = [
  "Bihar", "Himachal Pradesh", "Jharkhand", "Madhya Pradesh", "Rajasthan", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const StateheadDashboard = () => {
  const [selectedState, setSelectedState] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [engineers, setEngineers] = useState([]);
  const [dates, setDates] = useState([]);

  const handleStateChange = (e) => setSelectedState(e.target.value);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);

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

  

  // Function to filter out future dates
  const getFilteredDates = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    return dates.filter(date => date <= today); // Only return past and present dates
  };

  // Function to fetch engineers and dates from backend
  const fetchEngineers = useCallback(async () => {
    if (selectedState) {
      try {
        const response = await fetch(`${apiUrl}/api/user/engineers?state=${selectedState}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setEngineers(data.engineers); // Set dynamic engineers list
          setDates(data.dates); // Set dynamic dates list
        } else {
          console.error('Failed to fetch engineers:', data.error);
          toast.error('Failed to fetch engineers');
        }
      } catch (error) {
        console.error('An error occurred while fetching engineers:', error);
        toast.error('An error occurred while fetching engineers');
      }
    }
  }, [selectedState]);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);


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
            {/* Date picker */}
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

      {/* Table displaying engineers and attendance data */}
      <div className="mt-8">
        <div className="flex justify-between mb-2">
          <button
            onClick={() => setCurrentViewIndex(prev => Math.max(prev - 5, 0))}
            disabled={currentViewIndex === 0}
            className={`px-4 py-2 rounded bg-gray-300 ${currentViewIndex === 0 && 'opacity-50 cursor-not-allowed'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentViewIndex(prev => Math.min(prev + 5, getFilteredDates().length))}
            disabled={currentViewIndex + 5 >= getFilteredDates().length}
            className={`px-4 py-2 rounded bg-gray-300 ${currentViewIndex + 5 >= getFilteredDates().length && 'opacity-50 cursor-not-allowed'}`}
          >
            Next
          </button>
        </div>

        {/* Table */}
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 px-4 py-2">Engineer</th>
              {getFilteredDates().slice(currentViewIndex, currentViewIndex + 5).map((date) => (
                <th key={date} className="border border-gray-400 px-4 py-2">{date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {engineers.map((engineer, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{engineer.fullName}</td>
                {getFilteredDates().slice(currentViewIndex, currentViewIndex + 5).map((date, i) => {
                  const attendanceEntry = engineer.attendanceByDate.find(entry => entry.date === date);
                  return (
                    <td key={i} className="py-2 px-4 border-b">
                      {attendanceEntry ? attendanceEntry.count : '0'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StateheadDashboard;

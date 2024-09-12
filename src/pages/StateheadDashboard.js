import React, { useState, useEffect, useCallback } from "react";
import WorldMapStateHead from "../components/StateHead/WorldMapStateHead";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { format, subMonths } from 'date-fns'; // For date formatting and handling

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
  const [currentDateRange, setCurrentDateRange] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState("");

  const handleStateChange = (e) => setSelectedState(e.target.value);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const handlePurposeChange = (e) => setSelectedPurpose(e.target.value);
 
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

  // Function to get the previous month's dates (limit to 5)
  const getPreviousMonthDates = () => {
    const today = new Date();
    const previousMonth = subMonths(today, 1);
    const daysInMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
    
    const dates = [];
    for (let i = 1; i <= daysInMonth && dates.length < 5; i++) {
      dates.push(format(new Date(previousMonth.getFullYear(), previousMonth.getMonth(), i), "yyyy-MM-dd"));
    }
    return dates;
  };

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
          <table className="table-auto w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Engineer</th>
                {getPreviousMonthDates().map((date) => (
                  <th key={date} className="border p-2">{date}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engineers.map((engineer) => (
                <tr key={engineer}>
                  <td className="border p-2">{engineer}</td>
                  {getPreviousMonthDates().map((date) => (
                    <td key={date} className="border p-2">-</td>
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

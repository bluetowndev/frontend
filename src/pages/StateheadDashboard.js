import React, { useState, useEffect, useCallback } from "react";
// import LeaveApproval from "../components/StateHead/LeaveApproval";
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
  const [movementData, setMovementData] = useState([]);
  const [insights, setInsights] = useState({
    totalSiteVisits: 0,
    totalOtherVisits: 0,
    totalDistance: 0,
    userStats: [],
    dailyStats: [],
    averageDistancePerDay: 0,
    averageSiteVisitsPerDay: 0,
    averageOtherVisitsPerDay: 0,
    totalActiveUsers: 0,
    topPerformers: []
  });

  const handleStateChange = (e) => setSelectedState(e.target.value);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);

  // Function to fetch movement tracking data filtered by state
  const fetchMovementData = useCallback(async () => {
    if (selectedState && startDate) {
      const startInIST = new Date(startDate);
      startInIST.setMinutes(startInIST.getMinutes() + 330); // Convert to IST

      const endInIST = endDate ? new Date(endDate) : new Date(startInIST);
      endInIST.setMinutes(endInIST.getMinutes() + 330); // Convert to IST

      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : null;

      if (!token) {
        toast.error('No token found');
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/attendance/movement-tracking?state=${selectedState}&startDate=${startInIST.toISOString().split('T')[0]}&endDate=${endInIST.toISOString().split('T')[0]}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Process data and calculate stats
          const processedData = data.data.map(user => {
            const processedDailyMovements = user.dailyMovements.map(day => {
              // Calculate stats for all movements
              const siteVisits = day.movements.filter(m => m.purpose === 'Site Visit').length;
              const otherVisits = day.movements.filter(m => 
                m.purpose !== 'Site Visit' && 
                m.purpose !== 'Check In' && 
                m.purpose !== 'Check Out'
              ).length;

              return {
                ...day,
                siteVisits,
                otherVisits
              };
            });

            return {
              ...user,
              dailyMovements: processedDailyMovements
            };
          });

          setMovementData(processedData);
          calculateInsights(processedData);
        } else {
          console.error('Failed to fetch movement data:', data.error);
          toast.error('Failed to fetch movement data');
        }
      } catch (error) {
        console.error('An error occurred:', error);
        toast.error('An error occurred while fetching movement data');
      }
    }
  }, [selectedState, startDate, endDate]);

  // Calculate insights from movement data
  const calculateInsights = (data) => {
    let totalSiteVisits = 0;
    let totalOtherVisits = 0;
    let totalDistance = 0;
    const userStats = [];
    const dailyStatsMap = {};
    const userDistanceMap = {};
    const userSiteVisitsMap = {};

    // Process each user's data
    data.forEach(user => {
      let userSiteVisits = 0;
      let userOtherVisits = 0;
      let userDistance = 0;

      user.dailyMovements.forEach(day => {
        const date = day.date;
        const siteVisits = day.siteVisits || 0;
        const otherVisits = day.otherVisits || 0;
        const distance = day.totalDistance || 0;

        userSiteVisits += siteVisits;
        userOtherVisits += otherVisits;
        userDistance += distance;

        // Aggregate daily stats
        if (!dailyStatsMap[date]) {
          dailyStatsMap[date] = {
            date,
            totalDistance: 0,
            totalSiteVisits: 0,
            totalOtherVisits: 0,
            activeUsers: new Set()
          };
        }
        dailyStatsMap[date].totalDistance += distance;
        dailyStatsMap[date].totalSiteVisits += siteVisits;
        dailyStatsMap[date].totalOtherVisits += otherVisits;
        if (distance > 0 || siteVisits > 0 || otherVisits > 0) {
          dailyStatsMap[date].activeUsers.add(user.userInfo.email);
        }
      });

      totalSiteVisits += userSiteVisits;
      totalOtherVisits += userOtherVisits;
      totalDistance += userDistance;

      // Track user performance
      userDistanceMap[user.userInfo.email] = userDistance;
      userSiteVisitsMap[user.userInfo.email] = userSiteVisits;

      if (userSiteVisits > 0 || userOtherVisits > 0 || userDistance > 0) {
        userStats.push({
          name: user.userInfo.fullName,
          email: user.userInfo.email,
          siteVisits: userSiteVisits,
          otherVisits: userOtherVisits,
          distance: userDistance.toFixed(2)
        });
      }
    });

    // Convert daily stats map to array and sort by date
    const dailyStats = Object.values(dailyStatsMap).map(stat => ({
      ...stat,
      activeUsers: stat.activeUsers.size,
      formattedDate: new Date(stat.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate averages
    const totalDays = dailyStats.length || 1;
    const averageDistancePerDay = (totalDistance / totalDays).toFixed(2);
    const averageSiteVisitsPerDay = (totalSiteVisits / totalDays).toFixed(1);
    const averageOtherVisitsPerDay = (totalOtherVisits / totalDays).toFixed(1);

    // Get top performers (sort by distance)
    const sortedByDistance = [...userStats].sort((a, b) => parseFloat(b.distance) - parseFloat(a.distance));
    const topPerformers = sortedByDistance.slice(0, 5).map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    const totalActiveUsers = new Set(data.map(u => u.userInfo.email)).size;

    setInsights({
      totalSiteVisits,
      totalOtherVisits,
      totalDistance: totalDistance.toFixed(2),
      userStats,
      dailyStats,
      averageDistancePerDay,
      averageSiteVisitsPerDay,
      averageOtherVisitsPerDay,
      totalActiveUsers,
      topPerformers
    });
  };

  // Function to fetch the attendance data filtered by state
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
  
    // Process data to group by user and date
    const groupedData = {};
  
    data.forEach((entry) => {
      const userId = entry.user.email;
      const date = convertToIST(entry.timestamp).split(" ")[0]; // Extract only the date
  
      // Initialize group if not already present
      if (!groupedData[userId]) {
        groupedData[userId] = {};
      }
      if (!groupedData[userId][date]) {
        groupedData[userId][date] = [];
      }
  
      // Add the entry to the respective group
      groupedData[userId][date].push(entry);
    });
  
    // Prepare rows for Excel with sequential headings
    const excelRows = [];
    Object.keys(groupedData).forEach((userId) => {
      Object.keys(groupedData[userId]).forEach((date) => {
        const entries = groupedData[userId][date];
        const baseRow = {
          Email: entries[0].user.email,
          Name: entries[0].user.fullName,
          State: entries[0].user.state,
          "Mobile Number": entries[0].user.phoneNumber,
          Date: date,
          "Reporting Manager": entries[0].user.reportingManager,
        };
  
        // Add entries as columns dynamically
        entries.forEach((entry, index) => {
          const entryNumber = index + 1;
          baseRow[`Entry ${entryNumber} - Login Time`] = convertToIST(entry.timestamp);
          baseRow[`Entry ${entryNumber} - Location Latitude`] = entry.location.lat;
          baseRow[`Entry ${entryNumber} - Location Longitude`] = entry.location.lng;
          baseRow[`Entry ${entryNumber} - Location Name`] = entry.locationName;
          baseRow[`Entry ${entryNumber} - Purpose`] = entry.purpose;
          baseRow[`Entry ${entryNumber} - Feedback`] = entry.feedback;
        });
  
        excelRows.push(baseRow);
      });
    });
  
    // Convert to Excel and download
    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');
  
    // Download the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast.success(`${fileName} downloaded successfully`);
  };
 

  useEffect(() => {
    if (selectedState && startDate) {
      fetchMovementData();
    }
  }, [fetchMovementData, selectedState, startDate, endDate]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Leave Approval Section - Commented out */}
      {/* <div className="mb-6 md:mx-5">
        <LeaveApproval />
      </div> */}

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">State Head Dashboard</h1>
        <p className="text-gray-600">Monitor site visits, user movements, and distance travelled</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select State/UT</label>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="">Select State/UT</option>
              {statesAndUTs.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="yyyy-MM-dd"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholderText="Select Start Date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="yyyy-MM-dd"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholderText="Select End Date"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => downloadExcel(attendanceData, `attendance_data_${selectedState || 'all'}`)}
            disabled={attendanceData.length === 0}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Excel Report
          </button>
        </div>
      </div>

      {/* Insights Dashboard */}
      {selectedState && (
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Insights</h2>
                <p className="text-sm text-gray-600 mt-1">Data for {selectedState}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Site Visits Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-100">Total Site Visits</h3>
                  <div className="bg-blue-400 bg-opacity-30 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{insights.totalSiteVisits}</p>
                <p className="text-xs text-blue-100">Site visits in {selectedState}</p>
              </div>

              {/* Other Visits Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-purple-100">Other Visits</h3>
                  <div className="bg-purple-400 bg-opacity-30 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{insights.totalOtherVisits}</p>
                <p className="text-xs text-purple-100">Non-site visits in {selectedState}</p>
              </div>

              {/* Distance Travelled Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-green-100">Total Distance</h3>
                  <div className="bg-green-400 bg-opacity-30 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{insights.totalDistance} km</p>
                <p className="text-xs text-green-100">Total distance in {selectedState}</p>
              </div>
            </div>

            {/* Additional Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Average Distance/Day</div>
                <div className="text-2xl font-bold text-gray-900">{insights.averageDistancePerDay} km</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Avg Site Visits/Day</div>
                <div className="text-2xl font-bold text-gray-900">{insights.averageSiteVisitsPerDay}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Avg Other Visits/Day</div>
                <div className="text-2xl font-bold text-gray-900">{insights.averageOtherVisitsPerDay}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Active Users</div>
                <div className="text-2xl font-bold text-gray-900">{insights.totalActiveUsers}</div>
              </div>
            </div>

            {/* Date-wise Distance and Summary */}
            {insights.dailyStats.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Distance (km)</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Site Visits</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Other Visits</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Active Users</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {insights.dailyStats.map((day, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{day.formattedDate}</div>
                            <div className="text-xs text-gray-500">{day.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {day.totalDistance.toFixed(2)} km
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {day.totalSiteVisits}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              {day.totalOtherVisits}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              {day.activeUsers}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Performers */}
            {insights.topPerformers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers (by Distance)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.topPerformers.map((performer, index) => (
                    <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-sm mr-2">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{performer.name}</div>
                            <div className="text-xs text-gray-600">{performer.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-semibold text-gray-900">{performer.distance} km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Site Visits:</span>
                          <span className="font-semibold text-gray-900">{performer.siteVisits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Other Visits:</span>
                          <span className="font-semibold text-gray-900">{performer.otherVisits}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Statistics Table */}
            {insights.userStats.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All User Statistics</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Site Visits</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Other Visits</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Distance (km)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {insights.userStats.map((user, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.siteVisits}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              {user.otherVisits}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {user.distance} km
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {insights.userStats.length === 0 && selectedState && (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No data available for the selected state and date range</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engineers Attendance Table */}
      {selectedState && engineers.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Engineers Attendance</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentViewIndex(prev => Math.max(prev - 5, 0))}
                disabled={currentViewIndex === 0}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentViewIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentViewIndex(prev => Math.min(prev + 5, getFilteredDates().length))}
                disabled={currentViewIndex + 5 >= getFilteredDates().length}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentViewIndex + 5 >= getFilteredDates().length 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Engineer</th>
                  {getFilteredDates().slice(currentViewIndex, currentViewIndex + 5).map((date) => (
                    <th key={date} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {engineers.map((engineer, index) => (
                  <tr key={index} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{engineer.fullName}</td>
                    {getFilteredDates().slice(currentViewIndex, currentViewIndex + 5).map((date, i) => {
                      const attendanceEntry = engineer.attendanceByDate.find(entry => entry.date === date);
                      const count = attendanceEntry ? attendanceEntry.count : 0;
                      return (
                        <td key={i} className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                            count > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {count}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateheadDashboard;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/Sidebar_Admin";
import SiteAllocationManager from "../components/admin/SiteAllocationManager";
import ExcelTargetUpload from "../components/admin/ExcelTargetUpload";
import ExcelAchievementUpload from "../components/admin/ExcelAchievementUpload";
import EnhancedStatsDashboard from "../components/admin/EnhancedStatsDashboard";
import UserMovementTracker from "../components/admin/UserMovementTracker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

const apiUrl = process.env.REACT_APP_API_URL || "";

const statesAndUTs = [
  "Bihar", "Delhi", "Himachal Pradesh", "Jharkhand", "Madhya Pradesh", "Rajasthan", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "all"
];

const AdminDashboard = () => {
  const [selectedState, setSelectedState] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState("");
  const [fetchingData, setFetchingData] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Filter state for enhanced dashboard
  const [filters, setFilters] = useState({
    state: "all",
    email: "",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // New state variables for enhanced dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    topPerformers: [],
    recentActivity: [],
    stateWiseStats: {},
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  // Update filters when relevant state changes
  const updateFilters = () => {
    setFilters({
      state: selectedState || "all",
      email: searchEmail,
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  };

  const handleStateChange = (e) => setSelectedState(e.target.value);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const handleEmailChange = (e) => setSearchEmail(e.target.value);

  // Fetch comprehensive dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user ? user.token : null;

    if (!token) {
      toast.error("No token found");
      return;
    }

    setLoading(true);
    try {
      // Fetch all users
      const usersResponse = await fetch(`${apiUrl}/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allUsers = await usersResponse.json();

      // Fetch attendance data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const today = new Date();

      const attendanceResponse = await fetch(
        `${apiUrl}/api/attendance/filtered?startDate=${thirtyDaysAgo.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const attendanceData = await attendanceResponse.json();

      // Calculate statistics
      const totalUsers = allUsers.length;
      const activeUsers = new Set(attendanceData.map(entry => entry.user._id)).size;
      const totalAttendance = attendanceData.length;
      const averageAttendance = totalUsers > 0 ? (totalAttendance / totalUsers).toFixed(1) : 0;

      // Calculate state-wise statistics
      const stateWiseStats = {};
      allUsers.forEach(user => {
        if (!stateWiseStats[user.state]) {
          stateWiseStats[user.state] = { total: 0, active: 0 };
        }
        stateWiseStats[user.state].total++;
      });

      attendanceData.forEach(entry => {
        if (stateWiseStats[entry.user.state]) {
          stateWiseStats[entry.user.state].active++;
        }
      });

      // Get top performers (users with most attendance entries)
      const userAttendanceCount = {};
      attendanceData.forEach(entry => {
        const userId = entry.user._id;
        userAttendanceCount[userId] = (userAttendanceCount[userId] || 0) + 1;
      });

      const topPerformers = Object.entries(userAttendanceCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => {
          const user = allUsers.find(u => u._id === userId);
          return user ? { ...user, attendanceCount: count } : null;
        })
        .filter(Boolean);

      // Get recent activity (last 10 attendance entries)
      const recentActivity = attendanceData
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setDashboardStats({
        totalUsers,
        activeUsers,
        totalAttendance,
        averageAttendance,
        topPerformers,
        recentActivity,
        stateWiseStats,
        monthlyTrends: [] // Can be implemented later
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const fetchAttendanceData = useCallback(async () => {
    if (selectedState && startDate) {
      const startInIST = new Date(startDate);
      startInIST.setMinutes(startInIST.getMinutes() + 330); // Convert to IST

      const endInIST = endDate ? new Date(endDate) : new Date(startInIST);
      endInIST.setMinutes(endInIST.getMinutes() + 330); // Convert to IST

      const user = JSON.parse(localStorage.getItem("user")); // Get user from local storage
      const token = user ? user.token : null; // Extract token from user object

      if (!token) {
        toast.error("No token found");
        return;
      }

      setFetchingData(true);
      try {
        const stateQueryParam =
          selectedState === "all" ? "" : `state=${selectedState}&`;
        const response = await fetch(
          `${apiUrl}/api/attendance/filtered?${stateQueryParam}startDate=${startInIST
            .toISOString()
            .split("T")[0]}&endDate=${endInIST.toISOString().split("T")[0]}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setAttendanceData(data);
          toast.success("Attendance data fetched successfully");
        } else {
          console.error("Failed to fetch attendance data:", data.error);
          toast.error("Failed to fetch attendance data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        toast.error("An error occurred while fetching attendance data");
      } finally {
        setFetchingData(false);
      }
    }
  }, [selectedState, startDate, endDate]);

  const fetchUserData = async () => {
    if (searchEmail) {
      const user = JSON.parse(localStorage.getItem("user")); // Get user from local storage
      const token = user ? user.token : null; // Extract token from user object

      if (!token) {
        toast.error("No token found");
        return;
      }

      setFetchingData(true);
      try {
        const response = await fetch(
          `${apiUrl}/api/attendance/user?email=${searchEmail}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (data.length === 0) {
            setError("User does not exist");
            setUserData([]);
            toast.error("User does not exist");
          } else {
            setError("");
            setUserData(data);
            toast.success("User data fetched successfully");
          }
        } else {
          console.error("Failed to fetch user data:", data.error);
          setError("An error occurred while fetching user data");
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setError("An error occurred while fetching user data");
        toast.error("An error occurred while fetching user data");
      } finally {
        setFetchingData(false);
      }
    }
  };

  const convertToIST = (dateString) => {
    const date = new Date(dateString);
    const offset = 330; // IST offset in minutes
    date.setMinutes(date.getMinutes() + offset);
    return date.toISOString().replace("T", " ").substring(0, 19); // Format as YYYY-MM-DD HH:mm:ss
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
        groupedData[userId][date] = {
          totalDistance: entry.totalDistance || 0,
          entries: [],
        };
      }

      // Add the entry to the respective group
      groupedData[userId][date].entries.push(entry);
      groupedData[userId][date].totalDistance += entry.totalDistance || 0; // Add the distance
    });

    // Prepare rows for Excel with sequential headings
    const excelRows = [];
    Object.keys(groupedData).forEach((userId) => {
      Object.keys(groupedData[userId]).forEach((date) => {
        const group = groupedData[userId][date];
        const entries = group.entries;

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
          baseRow[`Entry ${entryNumber} - Login Time`] = convertToIST(
            entry.timestamp
          );
          baseRow[`Entry ${entryNumber} - Location Latitude`] =
            entry.location.lat;
          baseRow[`Entry ${entryNumber} - Location Longitude`] =
            entry.location.lng;
          baseRow[`Entry ${entryNumber} - Location Name`] =
            entry.locationName;
          baseRow[`Entry ${entryNumber} - Purpose`] = entry.purpose;
          baseRow[`Entry ${entryNumber} - Feedback`] = entry.feedback;
        });

        excelRows.push(baseRow);
      });
    });

    // Convert to Excel and download
    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Data");

    // Download the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast.success(`${fileName} downloaded successfully`);
  };

  useEffect(() => {
    if (selectedState && startDate) {
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, selectedState, startDate, endDate]);

  return (
    <div className="md:flex ">
      <AdminSidebar />
      <div className="flex flex-col flex-grow p-4">
        
        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-2 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span>📊</span>
            <span className="hidden sm:inline">Analytics Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("movement")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "movement"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">User Movement</span>
            <span className="sm:hidden">Movement</span>
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "attendance"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span>📋</span>
            <span className="hidden sm:inline">Attendance</span>
            <span className="sm:hidden">Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "users"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            <span>👥</span>
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Users</span>
          </button>
          <button
            onClick={() => setActiveTab("sites")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "sites"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            <span>📍</span>
            <span className="hidden sm:inline">Sites</span>
            <span className="sm:hidden">Sites</span>
          </button>
          <button
            onClick={() => setActiveTab("targets")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "targets"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            <span>🎯</span>
            <span className="hidden sm:inline">Targets</span>
            <span className="sm:hidden">Targets</span>
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "achievements"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <span>🏆</span>
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Achievements</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Global Filter Panel */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔍</span> Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/UT</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All States</option>
                    {statesAndUTs.filter(s => s !== 'all').map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select end date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={updateFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setSelectedState("all");
                    setSearchEmail("");
                    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                    setFilters({
                      state: "all",
                      email: "",
                      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Enhanced Stats Dashboard */}
            <EnhancedStatsDashboard filters={filters} />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab("movement")}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">🗺️</span>
                  <p className="text-sm font-medium text-blue-700">User Movement</p>
                </button>
                <button 
                  onClick={() => setActiveTab("attendance")}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">📋</span>
                  <p className="text-sm font-medium text-green-700">Attendance Data</p>
                </button>
                <button 
                  onClick={() => setActiveTab("targets")}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">🎯</span>
                  <p className="text-sm font-medium text-purple-700">Set Targets</p>
                </button>
                <button 
                  onClick={() => setActiveTab("achievements")}
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">🏆</span>
                  <p className="text-sm font-medium text-orange-700">Achievements</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "movement" && (
          <div className="space-y-6">
            {/* Filter Panel for Movement Tracking */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔍</span> Movement Tracking Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/UT</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All States</option>
                    {statesAndUTs.filter(s => s !== 'all').map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select end date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={updateFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* User Movement Tracker Component */}
            <UserMovementTracker filters={filters} />
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Total Users</h4>
                  <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalUsers}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-700 mb-2">Active Users</h4>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.activeUsers}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-700 mb-2">Inactive Users</h4>
                  <p className="text-2xl font-bold text-purple-600">{dashboardStats.totalUsers - dashboardStats.activeUsers}</p>
                </div>
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => setActiveTab("attendance")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  View User Details
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="flex flex-col md:flex-row md:mx-5 space-y-5 md:space-y-0 md:space-x-5 flex-grow">
            <div className="md:w-1/3 lg:w-2/3 w-full mb-2 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300"
                >
                  New Dashboard
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select State/UT</option>
                  {statesAndUTs.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
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
                  onClick={() => downloadExcel(attendanceData, "attendance_data")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300 w-full"
                >
                  Download State Data
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter registered email"
                  className="p-2 border rounded w-full"
                />
                <button
                  onClick={fetchUserData}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full"
                >
                  Fetch User Data
                </button>
                {userData.length > 0 && (
                  <button
                    onClick={() => downloadExcel(userData, "user_data")}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300 w-full"
                  >
                    Download User Data
                  </button>
                )}
                {error && (
                  <p className="text-red-500 text-center">{error}</p>
                )}
              </div>
            </div>
            <div className="md:w-2/3 lg:w-1/3 w-full">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">Total Entries</p>
                    <p className="text-2xl font-bold text-blue-600">{attendanceData.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">Unique Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Set(attendanceData.map(entry => entry.user._id)).size}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-700">States Covered</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {new Set(attendanceData.map(entry => entry.user.state)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sites" && (
          <div className="flex-grow">
            <SiteAllocationManager />
          </div>
        )}

        {activeTab === "targets" && (
          <div className="flex-grow">
            <ExcelTargetUpload />
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="flex-grow">
            <ExcelAchievementUpload />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


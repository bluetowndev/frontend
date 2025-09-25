import React, { useEffect, useRef, useState } from "react";
import LineChart from "../components/Chart";
import HorizentalGraph from "../components/HorizentalGraph";
import Jumbotron from "../components/Jumbotron";
import Sidebar from "../components/SideBar";
import CalendarView from "../components/CalendarView";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAttendance } from "../hooks/useAttendance";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useAuthContext();
  const { fetchAttendanceByDate } = useAttendance();
  const apiUrl = process.env.REACT_APP_API_URL || "";
  const [dashboardStats, setDashboardStats] = useState({
    attendanceRate: '0%',
    averageCheckIn: '00:00',
    siteVisits: 0,
    todayDistance: '0 km',
    trendData: {
      attendanceChange: '0%',
      checkInStatus: 'On Time',
      siteVisitsPeriod: 'This Month',
      distanceStatus: 'Today'
    }
  });

  const isDistanceSaved = useRef(false); // Track if saveTodayDistance has been called

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/attendance/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setDashboardStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    if (user) {
      fetchDashboardStats();
    }

    // Refresh stats every 4 minutes
    const interval = setInterval(() => {
      if (user) {
        fetchDashboardStats();
      }
    }, 60000 * 4);

    return () => clearInterval(interval);
  }, [user, apiUrl]);

  useEffect(() => {
    const saveTodayDistance = async () => {
      try {
        // Get today's date in IST
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        const istDate = new Date(now.getTime() + istOffset);

        // Format IST date to YYYY-MM-DD
        const formattedDate = istDate.toISOString().split("T")[0];

        // Fetch attendance data for today
        const attendanceData = await fetchAttendanceByDate(formattedDate);

        if (attendanceData.length > 0) {
          // Calculate and save the total distance for today
          await calculateAndSaveTotalDistance(attendanceData, formattedDate);
        } else {
          toast.info("No attendance data available for today.");
        }
      } catch (error) {
        toast.error("Failed to save today's total distance.");
      }
    };

    if (user && !isDistanceSaved.current) {
      isDistanceSaved.current = true; // Mark it as called
      saveTodayDistance();
    }
  }, [user, fetchAttendanceByDate]);

  const calculateTotalDistance = (attendanceData) => {
    let totalMeters = 0;
    const pointToPointDistances = [];
  
    attendanceData.forEach((entry, index) => {
      let distance = entry.distanceFromPrevious || "0 m";
      let numericDistance = 0;
  
      if (distance.includes("km")) {
        numericDistance = parseFloat(distance) * 1000; // Convert km to meters
      } else if (distance.includes("m")) {
        numericDistance = parseFloat(distance); // Already in meters
      }
  
      // Skip the first distance entry (it's always 0)
      if (index > 0) {
        totalMeters += numericDistance;
        
        // Use letters A, B, C, etc. for the point labels
        const fromLabel = String.fromCharCode(65 + index - 1);  // Converts index 0 to 'A', 1 to 'B', etc.
        const toLabel = String.fromCharCode(65 + index); // Converts index 1 to 'B', 2 to 'C', etc.
  
        pointToPointDistances.push({
          from: fromLabel,
          to: toLabel,
          distance: numericDistance / 1000, // Store in km
        });
      }
    });
  
    const totalKilometers = totalMeters / 1000; // Convert total to km
  
    return { totalKilometers, pointToPointDistances };
  };
  
  const calculateAndSaveTotalDistance = async (attendanceData, date) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.token;
  
      if (!token) {
        toast.error("User not authenticated!");
        return;
      }
  
      // Calculate total distance and point-to-point distances
      const { totalKilometers, pointToPointDistances } = calculateTotalDistance(attendanceData);
  
      const response = await fetch(`${apiUrl}/api/attendance/save-total-distance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          totalDistance: totalKilometers,
          pointToPointDistances,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        toast.success(result.message || "Total distance saved successfully!");
      } else {
        toast.error(result.message || "Failed to save total distance.");
      }
    } catch (error) {
      toast.error("Failed to save total distance.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Fixed position on desktop */}
        <div className="hidden lg:block fixed left-0 top-0 h-screen w-20">
          <div className="flex flex-col items-center justify-center h-full">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden py-2">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-20 pb-20 lg:pb-0"> {/* Added bottom padding for mobile */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Profile Banner */}
            <div className="mb-4 sm:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="px-4 sm:px-8 py-8 sm:py-12">
                <Jumbotron />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="bg-indigo-100 p-2 sm:p-3 rounded-xl">
                    <span className="text-xl sm:text-2xl">🎯</span>
                  </div>
                  <span className={`${
                    parseFloat(dashboardStats.trendData.attendanceChange) >= 0 
                      ? 'text-green-500 bg-green-50' 
                      : 'text-red-500 bg-red-50'
                  } px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
                    {dashboardStats.trendData.attendanceChange}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Attendance Rate</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{dashboardStats.attendanceRate}</p>
              </div>
              
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="bg-purple-100 p-2 sm:p-3 rounded-xl">
                    <span className="text-xl sm:text-2xl">⏰</span>
                  </div>
                  <span className={`${
                    dashboardStats.trendData.checkInStatus === 'On Time'
                      ? 'text-green-500 bg-green-50'
                      : 'text-yellow-500 bg-yellow-50'
                  } px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
                    {dashboardStats.trendData.checkInStatus}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Average Check-in</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{dashboardStats.averageCheckIn}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                    <span className="text-xl sm:text-2xl">📍</span>
                  </div>
                  <span className="text-blue-500 bg-blue-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {dashboardStats.trendData.siteVisitsPeriod}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Site Visits</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{dashboardStats.siteVisits}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="bg-emerald-100 p-2 sm:p-3 rounded-xl">
                      <span className="text-xl sm:text-2xl">🚶</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-500 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {dashboardStats.trendData.distanceStatus}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">{dashboardStats.currentDate}</span>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">Distance Covered</h3>
                  <div className="mt-1 sm:mt-2">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardStats.todayDistance}</p>
                    <p className="text-sm text-gray-500 mt-1">Monthly Total: {dashboardStats.monthlyTotalDistance}</p>
                  </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              {/* Analytics Section - Spans 2 columns */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                {/* Chart Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg sm:text-xl">📊</span>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Analytics Overview</h2>
                        <p className="text-xs sm:text-sm text-gray-500">Monthly attendance patterns</p>
                      </div>
                    </div>
                    <select className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm">
                      <option>Last 30 Days</option>
                      <option>Last 60 Days</option>
                      <option>Last 90 Days</option>
                    </select>
                  </div>
                  <LineChart />
                </div>

                {/* Monthly Summary */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg sm:text-xl">📈</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Monthly Summary</h2>
                      <p className="text-xs sm:text-sm text-gray-500">Attendance breakdown</p>
                    </div>
                  </div>
                  <HorizentalGraph
                    startDate="2025-07-01"
                    endDate="2025-07-31"
                    holidayArray={[
                      "2025-07-06",
                      "2025-07-13",
                      "2025-07-20",
                      "2025-07-27"
                    ]}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-8">
                {/* Calendar Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg sm:text-xl">📅</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Calendar</h2>
                      <p className="text-xs sm:text-sm text-gray-500">Attendance tracker</p>
                    </div>
                  </div>
                  <CalendarView />
                </div>

                {/* Help Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="bg-white/20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xl sm:text-2xl">🤝</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold">Need Help?</h2>
                  </div>
                  <p className="text-indigo-100 text-sm sm:text-base mb-4 sm:mb-6">
                    Having trouble with attendance tracking? Our support team is here to help you 24/7.
                  </p>
                  <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium transition-all duration-200">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
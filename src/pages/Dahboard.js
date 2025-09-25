import React, { useState } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

const apiUrl = process.env.REACT_APP_API_URL || "";

const Dashboard = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cards = [
    { 
      id: "noCheckin", 
      text: "Not Punched In", 
      color: "from-red-400 to-red-600", 
      icon: "🚫", 
      api: `${apiUrl}/api/attendance/no-checkin`,
      bgPattern: "bg-gradient-to-br"
    },
    { 
      id: "noCheckout", 
      text: "Not Punched Out", 
      color: "from-amber-400 to-orange-500", 
      icon: "⏳", 
      api: `${apiUrl}/api/attendance/no-checkout`,
      bgPattern: "bg-gradient-to-br"
    },
    { 
      id: "onLeave", 
      text: "On Leave", 
      color: "from-blue-400 to-blue-600", 
      icon: "🌴", 
      api: `${apiUrl}/api/attendance/onLeave`,
      bgPattern: "bg-gradient-to-br"
    },
    { 
      id: "absent", 
      text: "Absent", 
      color: "from-gray-400 to-gray-600", 
      icon: "❌", 
      api: `${apiUrl}/api/attendance/absent`,
      bgPattern: "bg-gradient-to-br"
    },
    { 
      id: "siteVisits", 
      text: "Site Visits", 
      color: "from-emerald-400 to-green-600", 
      icon: "📍", 
      api: `${apiUrl}/api/attendance/siteCount`,
      bgPattern: "bg-gradient-to-br"
    },
  ];

  const handleCardClick = async (card) => {
    if (!card.api) return;

    setSelectedCard(card.id);
    setLoading(true);
    setError(null);

    toast.loading("Loading data...", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    if (!token) {
      setError("Authorization token not found.");
      setLoading(false);
      toast.dismiss();
      return;
    }

    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Add query parameters for endpoints that need dates
      let apiUrl = card.api;
      if (card.id === "noCheckout" || card.id === "absent") {
        apiUrl = `${apiUrl}?startDate=${today}&endDate=${today}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Failed to fetch data.");
      }

      const responseData = await response.json();
      let transformedData;

      if (card.id === "noCheckout" || card.id === "absent") {
        // Handle date-wise data structure
        transformedData = Object.entries(responseData.data[today] || {}).map(([_, user], index) => ({
          serial: index + 1,
          fullName: user.fullName || "N/A",
          email: user.email || "N/A",
          visitCount: user.visitCount || 0,
          phoneNumber: user.phoneNumber || "N/A",
          state: user.state || "N/A",
          reportingManager: user.reportingManager || "N/A",
        }));
      } else {
        // Handle regular data structure
        transformedData = (responseData?.data || []).map((user, index) => ({
          serial: index + 1,
          fullName: user.fullName || "N/A",
          email: user.email || "N/A",
          visitCount: user.visitCount || 0,
          phoneNumber: user.phoneNumber || "N/A",
          state: user.state || "N/A",
          reportingManager: user.reportingManager || "N/A",
        }));
      }
      
      setData(transformedData);
      toast.success("Data loaded successfully!", {
        style: {
          borderRadius: '10px',
          background: '#4ade80',
          color: '#fff',
        }
      });
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to fetch data. Please try again.");
      toast.error("Failed to fetch data. Please try again.", {
        style: {
          borderRadius: '10px',
          background: '#ef4444',
          color: '#fff',
        }
      });
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  const downloadExcel = () => {
    if (!data || data.length === 0) {
      toast.error("No data available to download.", {
        style: {
          borderRadius: '10px',
          background: '#ef4444',
          color: '#fff',
        }
      });
      return;
    }
  
    // Exclude `visitCount` for all reports except "Site Visits"
    const exportData = data.map((row) => {
      const { visitCount, ...rest } = row;
      return selectedCard === "siteVisits" ? row : rest;
    });
  
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "attendance_report.xlsx");
    
    toast.success("Report downloaded successfully!", {
      style: {
        borderRadius: '10px',
        background: '#4ade80',
        color: '#fff',
      }
    });
  };

  const LoadingSkeleton = () => (
    <div className="bg-white p-8 rounded-2xl shadow-xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg mb-6 w-1/3"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTable = () => {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {cards.find((card) => card.id === selectedCard)?.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {cards.find((card) => card.id === selectedCard)?.text}
              </h2>
              <p className="text-gray-500">Total: {data.length} records</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {new Date().toLocaleDateString()}
          </div>
        </div>
        
        {data.length > 0 ? (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    {selectedCard === "siteVisits" && (
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Visit Count</th>
                    )}
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">State</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reporting Manager</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((user, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-200 group">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full text-sm font-bold">
                          {user.serial}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {user.fullName}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          {user.email}
                        </div>
                      </td>
                      {selectedCard === "siteVisits" && (
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full text-sm font-bold">
                            {user.visitCount}
                          </div>
                        </td>
                      )}
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                        {user.phoneNumber}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {user.state}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                        {user.reportingManager}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={downloadExcel}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-emerald-600 hover:to-green-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Found</h3>
            <p className="text-gray-500">No users found for the selected category.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600">Real-time attendance monitoring and analytics</p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`${card.bgPattern} ${card.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold mb-1 group-hover:scale-105 transition-transform duration-300">
                    {card.text}
                  </h2>
                  <p className="text-white/80 text-sm">Click to view details</p>
                </div>
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
              </div>

              {/* Loading indicator */}
              {loading && selectedCard === card.id && (
                <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {loading && <LoadingSkeleton />}
          
          {error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">⚠️</div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {selectedCard && data && !loading && renderTable()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

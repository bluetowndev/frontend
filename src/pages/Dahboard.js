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
    { id: "noCheckin", text: "Not Punched In", color: "bg-red-500", icon: "🚫", api: `${apiUrl}/api/attendance/no-checkin` },
    { id: "noCheckout", text: "Not Punched Out", color: "bg-yellow-500", icon: "⏳", api: `${apiUrl}/api/attendance/no-checkout` },
    { id: "onLeave", text: "On Leave", color: "bg-blue-500", icon: "🌴", api: `${apiUrl}/api/attendance/onLeave` },
    { id: "absent", text: "Absent", color: "bg-gray-500", icon: "❌", api: `${apiUrl}/api/attendance/absent` },
    { id: "siteVisits", text: "Site Visits", color: "bg-green-500", icon: "📍", api: `${apiUrl}/api/attendance/siteCount` },
  ];

  const handleCardClick = async (card) => {
    if (!card.api) return;

    setSelectedCard(card.id);
    setLoading(true);
    setError(null);

    toast.loading("Loading data...");
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
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to fetch data. Please try again.");
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  const downloadExcel = () => {
    if (!data || data.length === 0) {
      toast.error("No data available to download.");
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
  };
  

  const renderTable = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {cards.find((card) => card.id === selectedCard)?.text} (Total: {data.length})
        </h2>
        {data.length > 0 ? (
          <div>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">S.No</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Full Name</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Email</th>
                  {selectedCard === "siteVisits" && (
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Visit Count</th>
                  )}
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Phone Number</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">State</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Reporting Manager</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-6 text-sm font-medium text-gray-700">{user.serial}</td>
                    <td className="py-3 px-6 text-sm font-medium text-gray-700">{user.fullName}</td>
                    <td className="py-3 px-6 text-sm font-medium text-gray-700">{user.email}</td>
                    {selectedCard === "siteVisits" && (
                      <td className="py-3 px-6 text-sm font-medium text-gray-700">{user.visitCount}</td>
                    )}
                    <td className="py-3 px-6 text-sm font-medium text-gray-700">{user.phoneNumber}</td>
                    <td className="py-3 px-6 text-sm font-medium text-gray-700">{user.state}</td>
                    <td className="py-3 px-6 text-sm font-medium text-gray-700">{user.reportingManager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={downloadExcel}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              Download Report
            </button>
          </div>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`${card.color} text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between cursor-pointer`}
          >
            <div>
              <h2 className="text-xl font-semibold">{card.text}</h2>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        {loading && <p className="text-lg text-gray-700">Loading...</p>}
        {error && <p className="text-lg text-red-500">{error}</p>}
        {selectedCard && data && renderTable()}
      </div>
    </div>
  );
};

export default Dashboard;

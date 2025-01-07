// src/pages/Dashboard.js
import React from "react";

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded shadow">Card 1</div>
        <div className="p-4 bg-white rounded shadow">Card 2</div>
        <div className="p-4 bg-white rounded shadow">Card 3</div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.REACT_APP_API_URL || "";

const UserMovementTracker = ({ filters }) => {
  const [movementData, setMovementData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    fetchMovementData();
  }, [filters]);

  const fetchMovementData = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.email) params.append('email', filters.email);
      if (filters.state && filters.state !== 'all') params.append('state', filters.state);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${apiUrl}/api/attendance/movement-tracking?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setMovementData(data.data || []);
      } else {
        toast.error(data.error || "Failed to fetch movement data");
      }
    } catch (error) {
      console.error("Error fetching movement data:", error);
      toast.error("Failed to fetch movement data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleDateExpansion = (userId, date) => {
    const key = `${userId}-${date}`;
    setExpandedDates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getPurposeColor = (purpose) => {
    switch (purpose) {
      case 'Check In': return 'bg-green-100 text-green-800';
      case 'Check Out': return 'bg-red-100 text-red-800';
      case 'Site Visit': return 'bg-blue-100 text-blue-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (movementData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500">No movement data found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {movementData.map((userData) => (
        <div key={userData.userInfo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* User Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-900">{userData.userInfo.fullName}</h3>
                <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="mr-1">📧</span> {userData.userInfo.email}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">📍</span> {userData.userInfo.state}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">📞</span> {userData.userInfo.phoneNumber}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-600">
                  {userData.dailyMovements.length} {userData.dailyMovements.length === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Movements */}
          <div className="divide-y divide-gray-100">
            {userData.dailyMovements.map((day) => {
              const isExpanded = expandedDates[`${userData.userInfo.id}-${day.date}`];
              
              return (
                <div key={day.date} className="p-4 hover:bg-gray-50 transition duration-200">
                  {/* Date Header */}
                  <div 
                    className="flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer"
                    onClick={() => toggleDateExpansion(userData.userInfo.id, day.date)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2 md:mb-0">
                        <span className="text-2xl">{isExpanded ? '📂' : '📁'}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{formatDate(day.date)}</h4>
                          <p className="text-sm text-gray-600">{day.movements.length} movements</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:flex md:gap-4 gap-2 mt-2 md:mt-0">
                      {day.checkInTime && (
                        <div className="bg-green-50 px-3 py-2 rounded-lg">
                          <p className="text-xs text-green-700 font-medium">Check-In</p>
                          <p className="text-sm font-semibold text-green-900">{formatTime(day.checkInTime)}</p>
                        </div>
                      )}
                      {day.checkOutTime && (
                        <div className="bg-red-50 px-3 py-2 rounded-lg">
                          <p className="text-xs text-red-700 font-medium">Check-Out</p>
                          <p className="text-sm font-semibold text-red-900">{formatTime(day.checkOutTime)}</p>
                        </div>
                      )}
                      {day.siteVisits > 0 && (
                        <div className="bg-blue-50 px-3 py-2 rounded-lg">
                          <p className="text-xs text-blue-700 font-medium">Site Visits</p>
                          <p className="text-sm font-semibold text-blue-900">{day.siteVisits}</p>
                        </div>
                      )}
                      {day.totalDistance > 0 && (
                        <div className="bg-purple-50 px-3 py-2 rounded-lg">
                          <p className="text-xs text-purple-700 font-medium">Distance</p>
                          <p className="text-sm font-semibold text-purple-900">{day.totalDistance.toFixed(1)} km</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Movement Details */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      {/* Movement Timeline */}
                      <div className="relative pl-8 space-y-4">
                        {day.movements.map((movement, index) => (
                          <div key={movement.id} className="relative">
                            {/* Timeline Line */}
                            {index < day.movements.length - 1 && (
                              <div className="absolute left-[-20px] top-6 w-0.5 h-full bg-gray-200"></div>
                            )}
                            
                            {/* Timeline Dot */}
                            <div className="absolute left-[-26px] top-2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>

                            {/* Movement Card */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPurposeColor(movement.purpose)}`}>
                                      {movement.purpose}
                                    </span>
                                    {movement.subPurpose && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                        {movement.subPurpose}
                                      </span>
                                    )}
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatTime(movement.timestamp)}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-1 text-sm">
                                    <p className="text-gray-700">
                                      <span className="font-medium">📍 Location:</span> {movement.locationName || 'Unknown'}
                                    </p>
                                    <p className="text-gray-600">
                                      <span className="font-medium">🗺️ Coordinates:</span> {movement.location?.lat?.toFixed(6)}, {movement.location?.lng?.toFixed(6)}
                                    </p>
                                    {movement.feedback && (
                                      <p className="text-gray-600">
                                        <span className="font-medium">💬 Feedback:</span> {movement.feedback}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {movement.image && (
                                  <img 
                                    src={movement.image} 
                                    alt="Movement" 
                                    className="mt-2 md:mt-0 md:ml-4 w-full md:w-24 h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => window.open(movement.image, '_blank')}
                                  />
                                )}
                              </div>

                              {/* Point-to-point distance */}
                              {index > 0 && day.pointToPointDistances && day.pointToPointDistances[index - 1] && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <span className="text-gray-600">
                                      <span className="font-medium">🚗 From:</span> {day.pointToPointDistances[index - 1].from}
                                    </span>
                                    <span className="text-gray-600">
                                      <span className="font-medium">➡️ To:</span> {day.pointToPointDistances[index - 1].to}
                                    </span>
                                    <span className="text-gray-700 font-semibold">
                                      {day.pointToPointDistances[index - 1].distance.toFixed(2)} km
                                    </span>
                                    {day.pointToPointDistances[index - 1].transitTime && (
                                      <span className="text-gray-600">
                                        ⏱️ {day.pointToPointDistances[index - 1].transitTime}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Day Summary */}
                      {(day.startLocation || day.endLocation) && (
                        <div className="bg-blue-50 rounded-lg p-4 mt-4">
                          <h5 className="font-semibold text-blue-900 mb-2">📊 Day Summary</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {day.startLocation && (
                              <div>
                                <p className="text-blue-700 font-medium">Start Location:</p>
                                <p className="text-blue-900">{day.startLocation.name}</p>
                              </div>
                            )}
                            {day.endLocation && (
                              <div>
                                <p className="text-blue-700 font-medium">End Location:</p>
                                <p className="text-blue-900">{day.endLocation.name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserMovementTracker;


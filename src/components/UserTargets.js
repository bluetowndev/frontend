import React, { useState, useEffect } from 'react';
import { useUserTargets } from '../hooks/useUserTargets';
import toast from 'react-hot-toast';

const UserTargets = () => {
  const { getCurrentUserTargets, error, isLoading } = useUserTargets();
  const [targets, setTargets] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await getCurrentUserTargets();
        if (response.success) {
          setTargets(response.data);
        }
      } catch (error) {
        console.error('Error fetching targets:', error);
        // Don't show error toast for targets as they might not exist yet
      }
    };

    fetchTargets();

    // Set current month
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    setCurrentMonth(monthNames[now.getMonth()]);
  }, []);

  const getCurrentYearTargets = () => {
    if (!targets || !targets.targets) return [];
    
    return targets.targets.filter(target => target.year === 2025);
  };

  const getTargetForMonth = (month) => {
    const yearTargets = getCurrentYearTargets();
    const target = yearTargets.find(t => t.month === month);
    return target ? target.target : null;
  };

  const formatTarget = (target) => {
    if (target === null || target === undefined) return 'Not Set';
    return target.toLocaleString();
  };

  const getProgressColor = (month) => {
    const target = getTargetForMonth(month);
    if (target === null) return 'text-gray-500';
    if (target >= 100) return 'text-green-600';
    if (target >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (month) => {
    const target = getTargetForMonth(month);
    if (target === null) return 'bg-gray-100';
    if (target >= 100) return 'bg-green-100';
    if (target >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="bg-gray-200 w-10 h-10 sm:w-12 sm:h-12 rounded-xl"></div>
            <div>
              <div className="bg-gray-200 h-4 w-32 mb-2 rounded"></div>
              <div className="bg-gray-200 h-3 w-24 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const yearTargets = getCurrentYearTargets();
  const hasAnyTargets = yearTargets.length > 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg sm:text-xl">🎯</span>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Monthly Targets</h2>
          <p className="text-xs sm:text-sm text-gray-500">2025 Target Goals</p>
        </div>
      </div>

      {!hasAnyTargets ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🎯</div>
          <p className="text-gray-500 text-sm">No targets set for 2025</p>
          <p className="text-gray-400 text-xs mt-1">Contact your manager to set targets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {['September', 'October', 'November'].map((month) => {
            const target = getTargetForMonth(month);
            const isCurrentMonth = month === currentMonth;
            
            return (
              <div
                key={month}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                  isCurrentMonth 
                    ? 'border-orange-200 bg-orange-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      isCurrentMonth ? 'bg-orange-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <h3 className={`font-semibold text-sm ${
                        isCurrentMonth ? 'text-orange-800' : 'text-gray-700'
                      }`}>
                        {month} 2025
                        {isCurrentMonth && (
                          <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">Monthly Target</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg sm:text-xl font-bold ${getProgressColor(month)}`}>
                      {formatTarget(target)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getProgressBgColor(month)} ${getProgressColor(month)}`}>
                      {target !== null ? 'Set' : 'Not Set'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default UserTargets;

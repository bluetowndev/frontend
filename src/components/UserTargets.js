import React, { useState, useEffect } from 'react';
import { useUserTargets } from '../hooks/useUserTargets';
import { useUserAchievements } from '../hooks/useUserAchievements';
import toast from 'react-hot-toast';

const UserTargets = () => {
  const { getCurrentUserTargets, error, isLoading } = useUserTargets();
  const { getCurrentUserAchievements } = useUserAchievements();
  const [targets, setTargets] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch targets
        const targetsResponse = await getCurrentUserTargets();
        if (targetsResponse.success) {
          setTargets(targetsResponse.data);
        }

        // Fetch achievements
        const achievementsResponse = await getCurrentUserAchievements();
        console.log('Achievements response:', achievementsResponse);
        if (achievementsResponse.success) {
          setAchievements(achievementsResponse.data);
          console.log('Achievements data set:', achievementsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Don't show error toast as data might not exist yet
      }
    };

    fetchData();

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

  const getCurrentYearAchievements = () => {
    if (!achievements || !achievements.achievements) return [];
    
    return achievements.achievements.filter(achievement => achievement.year === 2025);
  };

  const getAchievementForMonth = (month) => {
    const yearAchievements = getCurrentYearAchievements();
    const achievement = yearAchievements.find(a => a.month === month);
    return achievement ? achievement.achievement : null;
  };

  const formatTarget = (target) => {
    if (target === null || target === undefined) return 'Not Set';
    return target.toLocaleString();
  };

  const getStatusColor = (month) => {
    const target = getTargetForMonth(month);
    const achievement = getAchievementForMonth(month);
    
    if (target === null || achievement === null) return 'text-gray-500';
    
    const percentage = (achievement / target) * 100;
    
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = (month) => {
    const target = getTargetForMonth(month);
    const achievement = getAchievementForMonth(month);
    
    if (target === null || achievement === null) return 'bg-gray-100';
    
    const percentage = (achievement / target) * 100;
    
    if (percentage >= 100) return 'bg-green-100';
    if (percentage >= 95) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusText = (month) => {
    const target = getTargetForMonth(month);
    const achievement = getAchievementForMonth(month);
    
    if (target === null) return 'Target Not Set';
    if (achievement === null) return 'No Achievement';
    
    const percentage = (achievement / target) * 100;
    
    if (percentage >= 100) return 'Target Achieved';
    if (percentage >= 95) return 'Close to Target';
    return 'Below Target';
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
            const achievement = getAchievementForMonth(month);
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
                      <p className="text-xs text-gray-500">Target vs Achievement</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-600">Target:</span>
                        <span className="text-base font-bold text-gray-800">
                          {formatTarget(target)}
                        </span>
                      </div>
                      {achievement !== null && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-600">Achieved:</span>
                          <span className="text-base font-bold text-gray-800">
                            {achievement.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded-full mt-2 ${getStatusBgColor(month)} ${getStatusColor(month)}`}>
                      {getStatusText(month)}
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

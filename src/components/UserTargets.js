import React, { useState, useEffect } from 'react';
import { useUserTargets } from '../hooks/useUserTargets';
import { useUserAchievements } from '../hooks/useUserAchievements';
import lakshyaImage from '../assets/lakshya.jpg';

const UserTargets = () => {
  const { getCurrentUserTargets, error, isLoading } =
    useUserTargets();

  const { getCurrentUserAchievements } =
    useUserAchievements();

  const [targets, setTargets] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('');
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TARGETS
        const targetsResponse =
          await getCurrentUserTargets();

        console.log(
          'FULL TARGET RESPONSE =',
          targetsResponse
        );

        if (targetsResponse?.success) {
          console.log(
            'TARGET DATA =',
            targetsResponse.data
          );

          setTargets(targetsResponse.data);
        }

        // ACHIEVEMENTS
        const achievementsResponse =
          await getCurrentUserAchievements();

        console.log(
          'FULL ACHIEVEMENT RESPONSE =',
          achievementsResponse
        );

        if (achievementsResponse?.success) {
          console.log(
            'ACHIEVEMENT DATA =',
            achievementsResponse.data
          );

          setAchievements(achievementsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();

    // CURRENT MONTH
    const now = new Date();

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    setCurrentMonth(monthNames[now.getMonth()]);

    // TODAY DATE
    const today = new Date();

    setTodayDate(
      today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );
  }, []);

  // ================= TARGETS =================

  const getCurrentYearTargets = () => {
    console.log('TARGET STATE =', targets);

    if (!targets) return [];

    // CASE 1
    if (Array.isArray(targets)) {
      return targets;
    }

    // CASE 2
    if (Array.isArray(targets.targets)) {
      return targets.targets;
    }

    // CASE 3
    if (
      targets.may2026 !== undefined ||
      targets.june2026 !== undefined ||
      targets.july2026 !== undefined
    ) {
      return [
        {
          month: 'May',
          target: targets.may2026 || 0,
          year: 2026
        },
        {
          month: 'June',
          target: targets.june2026 || 0,
          year: 2026
        },
        {
          month: 'July',
          target: targets.july2026 || 0,
          year: 2026
        }
      ];
    }

    return [];
  };

  const getTargetForMonth = (month) => {
    const yearTargets = getCurrentYearTargets();

    const target = yearTargets.find(
      (t) =>
        t.month?.toLowerCase() ===
        month.toLowerCase()
    );

    return target
      ? Number(
          target.target ||
            target.value ||
            target.amount ||
            0
        )
      : null;
  };

  // ================= ACHIEVEMENTS =================

  const getCurrentYearAchievements = () => {
    console.log(
      'ACHIEVEMENT STATE =',
      achievements
    );

    if (!achievements) return [];

    // CASE 1
    if (Array.isArray(achievements)) {
      return achievements;
    }

    // CASE 2
    if (Array.isArray(achievements.achievements)) {
      return achievements.achievements;
    }

    // CASE 3
    if (
      achievements.may2026 !== undefined ||
      achievements.june2026 !== undefined ||
      achievements.july2026 !== undefined
    ) {
      return [
        {
          month: 'May',
          achievement: achievements.may2026 || 0
        },
        {
          month: 'June',
          achievement: achievements.june2026 || 0
        },
        {
          month: 'July',
          achievement: achievements.july2026 || 0
        }
      ];
    }

    return [];
  };

  const getAchievementForMonth = (month) => {
    const yearAchievements =
      getCurrentYearAchievements();

    const achievement = yearAchievements.find(
      (a) =>
        a.month?.toLowerCase() ===
        month.toLowerCase()
    );

    return achievement
      ? Number(
          achievement.achievement ||
            achievement.value ||
            achievement.amount ||
            achievement.target ||
            0
        )
      : null;
  };

  // ================= STATUS =================

  const getStatusColor = (month) => {
    const target = getTargetForMonth(month);

    const achievement =
      getAchievementForMonth(month);

    if (target === null || achievement === null) {
      return 'text-gray-500';
    }

    const percentage =
      target > 0 ? (achievement / target) * 100 : 0;

    if (percentage >= 100) return 'text-green-600';

    if (percentage >= 95)
      return 'text-yellow-600';

    return 'text-red-600';
  };

  const getStatusBgColor = (month) => {
    const target = getTargetForMonth(month);

    const achievement =
      getAchievementForMonth(month);

    if (target === null || achievement === null) {
      return 'bg-gray-100';
    }

    const percentage =
      target > 0 ? (achievement / target) * 100 : 0;

    if (percentage >= 100) return 'bg-green-100';

    if (percentage >= 95)
      return 'bg-yellow-100';

    return 'bg-red-100';
  };

  const getStatusText = (month) => {
    const target = getTargetForMonth(month);

    const achievement =
      getAchievementForMonth(month);

    if (target === null) return 'Target Not Set';

    if (achievement === null)
      return 'No Achievement';

    const percentage =
      target > 0 ? (achievement / target) * 100 : 0;

    if (percentage >= 100)
      return 'Target Achieved';

    if (percentage >= 95)
      return 'Close to Target';

    return 'Below Target';
  };

  // ================= LOADING =================

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-200 h-16 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const yearTargets = getCurrentYearTargets();

  const hasAnyTargets = yearTargets.length > 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      {/* IMAGE */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-white p-1.5">
          <img
            src={lakshyaImage}
            alt="Lakshya Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* NO TARGET - icon removed */}
      {!hasAnyTargets ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            No targets set for 2026
          </p>

          <p className="text-gray-400 text-xs mt-1">
            Contact your manager to set targets
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {['May', 'June', 'July'].map((month) => {
            const target =
              getTargetForMonth(month);

            const achievement =
              getAchievementForMonth(month);

            const isCurrentMonth =
              month === currentMonth &&
              new Date().getFullYear() === 2026;

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
                  {/* LEFT */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCurrentMonth
                          ? 'bg-orange-500'
                          : 'bg-gray-400'
                      }`}
                    ></div>

                    <div>
                      <h3
                        className={`font-semibold text-sm ${
                          isCurrentMonth
                            ? 'text-orange-800'
                            : 'text-gray-700'
                        }`}
                      >
                        {month} 2026

                        {isCurrentMonth && (
                          <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </h3>

                      <p className="text-xs text-gray-500">
                        Target vs Achievement
                      </p>

                      {isCurrentMonth && (
                        <div className="mt-2 p-1.5 bg-blue-50 rounded-md border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium">
                            Today:
                          </p>

                          <p className="text-xs text-blue-800 font-semibold">
                            {todayDate}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-sm font-bold text-gray-600">
                          Target:
                        </span>

                        {/* CHANGE 2 - added % after number */}
                        <span className="text-base font-bold text-gray-800">
                          {target !== null
                            ? `${Math.round(target).toLocaleString()}%`
                            : 'Not Set'}
                        </span>
                      </div>

                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-sm font-bold text-gray-600">
                          Achieved:
                        </span>

                        {/* CHANGE 2 - added % after number */}
                        <span className="text-base font-bold text-gray-800">
                          {achievement !== null
                            ? `${Math.round(achievement).toLocaleString()}%`
                            : '0%'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-bold px-2 py-1 rounded-full mt-2 ${getStatusBgColor(
                        month
                      )} ${getStatusColor(month)}`}
                    >
                      {getStatusText(month)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTargets;
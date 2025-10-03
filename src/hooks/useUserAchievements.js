import { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL || '';

export const useUserAchievements = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentUserAchievements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let token = localStorage.getItem('token');
      
      // If token is not found directly, check if it's stored as part of an object
      if (!token) {
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          token = userData.token;
        } catch (error) {
          console.log('Error parsing user data:', error);
        }
      }
      
      console.log('getCurrentUserAchievements - Token check:', { token, exists: !!token, length: token?.length });
      
      // Check if token exists
      if (!token) {
        console.log('No token found in getCurrentUserAchievements, clearing auth...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${apiUrl}/api/user-achievements/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        
        throw new Error(errorData.error || 'Failed to fetch achievements');
      }

      const data = await response.json();
      console.log('Achievements fetched successfully:', data);
      console.log('Achievements data structure:', {
        success: data.success,
        hasData: !!data.data,
        achievements: data.data?.achievements,
        achievementsLength: data.data?.achievements?.length
      });
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAchievementsByEmail = async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/user-achievements/user?email=${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch achievements');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addOrUpdateAchievement = async (email, month, year, achievement) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/user-achievements/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          month,
          year,
          achievement
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add/update achievement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkImportAchievements = async (achievementsData) => {
    setIsLoading(true);
    setError(null);

    try {
      let token = localStorage.getItem('token');
      
      // If token is not found directly, check if it's stored as part of an object
      if (!token) {
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          token = userData.token;
        } catch (error) {
          console.log('Error parsing user data:', error);
        }
      }
      
      console.log('useUserAchievements - Token check:', { token, exists: !!token, length: token?.length });
      
      // Check if token exists
      if (!token) {
        console.log('No token found in useUserAchievements, clearing auth...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${apiUrl}/api/user-achievements/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievementsData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        
        throw new Error(errorData.error || 'Failed to import achievements');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAchievement = async (email, month, year) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/user-achievements/remove`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          month,
          year
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove achievement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllUserAchievements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/user-achievements/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch all achievements');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getCurrentUserAchievements,
    getUserAchievementsByEmail,
    addOrUpdateAchievement,
    bulkImportAchievements,
    removeAchievement,
    getAllUserAchievements,
    error,
    isLoading
  };
};

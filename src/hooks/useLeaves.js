import { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL || '';

export const useLeaves = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get authentication token
  const getToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        token = userData.token;
      } catch (error) {
        console.log('Error parsing user data:', error);
      }
    }
    return token;
  };

  // Apply for leave
  const applyForLeave = async (leaveData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/leaves/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || 'Failed to apply for leave');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current user's leaves
  const getCurrentUserLeaves = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/leaves/my-leaves`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || 'Failed to fetch leaves');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get leaves for approval (state head)
  const getLeavesForApproval = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/leaves/for-approval`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || 'Failed to fetch leaves for approval');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Approve or reject leave
  const approveOrRejectLeave = async (leaveId, action, rejectionReason = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/leaves/approve-reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaveId,
          action,
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || 'Failed to process leave application');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all leaves (admin)
  const getAllLeaves = async (filters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const url = `${apiUrl}/api/leaves/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || 'Failed to fetch leaves');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get leave statistics (admin)
  const getLeaveStatistics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/leaves/statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || 'Failed to fetch leave statistics');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applyForLeave,
    getCurrentUserLeaves,
    getLeavesForApproval,
    approveOrRejectLeave,
    getAllLeaves,
    getLeaveStatistics,
    error,
    isLoading,
  };
};


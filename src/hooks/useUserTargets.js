import { useState } from 'react';

export const useUserTargets = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL || '';

  const getCurrentUserTargets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/user-targets/current`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch targets');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTargetsByEmail = async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/user-targets/user?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch targets');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addOrUpdateTarget = async (email, month, year, target) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/user-targets/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          email,
          month,
          year,
          target
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add/update target');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkImportTargets = async (targetsData) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/user-targets/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          targetsData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import targets');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeTarget = async (email, month, year) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/user-targets/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          email,
          month,
          year
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove target');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllUserTargets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${apiUrl}/api/user-targets/all`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch all targets');
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
    getCurrentUserTargets,
    getUserTargetsByEmail,
    addOrUpdateTarget,
    bulkImportTargets,
    removeTarget,
    getAllUserTargets,
    error,
    isLoading
  };
};

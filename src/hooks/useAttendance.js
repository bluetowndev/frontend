import { useState } from 'react';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.REACT_APP_API_URL || '';

export const useAttendance = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const markAttendance = async (imageSrc, location, userId, purpose, feedback) => {
    setIsLoading(true);
    setError(null);
    toast.loading('Submitting record...');

    const token = JSON.parse(localStorage.getItem('user')).token;

    const formData = new FormData();
    formData.append('image', imageSrc);
    formData.append('location', JSON.stringify(location));
    formData.append('userId', userId);
    formData.append('purpose', purpose);
    formData.append('feedback', feedback);

    try {
      const response = await fetch(`${apiUrl}/api/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }
      toast.dismiss();
      toast.success("You're in 👍");
    } catch (err) {
      setError(err.message);
      toast.dismiss();
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchAttendanceByDate = async (date) => {
    setIsLoading(true);
    setError(null);
    toast.loading('Fetching record...');

    const token = JSON.parse(localStorage.getItem('user')).token;

    // try {
    //   const response = await fetch(`${apiUrl}/api/attendance?date=${date}`, {
    //     method: 'GET',
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //     },
    //   });

    try {
      const response = await fetch(`${apiUrl}/api/attendance/with-distances?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }

      toast.dismiss();
      toast.success('Details fetched successfully!');
      return json;
    } catch (err) {
      setError(err.message);
      toast.dismiss();
      toast.error(`Error: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAttendance = async () => {
    setIsLoading(true);
    setError(null);
    toast.loading('Fetching all details...');

    const token = JSON.parse(localStorage.getItem('user')).token;

    try {
      const response = await fetch(`${apiUrl}/api/attendance/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }

      toast.dismiss();
      toast.success('All records fetched successfully!');
      return json.map(attendance => ({
        ...attendance,
        date: new Date(attendance.date).toISOString(),
        timestamp: new Date(attendance.timestamp).toISOString(),
      }));
    } catch (err) {
      setError(err.message);
      toast.dismiss();
      toast.error(`Error: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { markAttendance, fetchAttendanceByDate, fetchAllAttendance, isLoading, error };
};

import { useState, useEffect } from 'react';
const apiUrl = process.env.REACT_APP_API_URL || '';

export const useUnmarkedAttendanceUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/user/users-without-attendance`);
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch unmarked attendance users.');
      }
    };

    fetchUsers();
  }, []);

  return { users, error };
};

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const signup = async (email, password, fullName, phoneNumber, reportingManager, state) => {
    setIsLoading(true);
    setError(null);

    const toastId = toast.loading('Signing up...');
    const apiUrl = process.env.REACT_APP_API_URL || '';
  
    const response = await fetch(`${apiUrl}/api/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, phoneNumber, reportingManager, state })
    });
    const json = await response.json();
  
    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
      toast.error(json.error, { id: toastId });
      return false;
    }
  
    setIsLoading(false);
    toast.success('Signup successful!', { id: toastId });
    return true;
  };

  return { signup, isLoading, error };
};

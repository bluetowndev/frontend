import { useAuthContext } from './useAuthContext';
import { toast } from 'react-hot-toast';

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = () => {
    // remove user from storage
    localStorage.removeItem('user');

    // dispatch logout action
    dispatch({ type: 'LOGOUT' });

    // show success notification
    toast.success('Logged out successfully');
  };

  return { logout };
};

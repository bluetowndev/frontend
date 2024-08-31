import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleClick = () => {
    logout();
  };

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="text-white text-2xl font-bold flex items-center">
            <img
              src="./bluetown_logo.svg"
              alt="BlueTown Logo"
              className="h-12 w-12 mr-2 ml-4"
            />
            <h1>BlueTown</h1>
          </Link>
          <div className="md:hidden">
            {user ? (
              <button
                onClick={handleClick}
                className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded hover:bg-indigo-600 hover:text-white transition duration-300"
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
        <nav className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mt-2 md:mt-0">
          {user && (
            <>
              <span className="text-white">{user.email}</span>
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="text-white">
                  {/* Admin Dashboard */}
                </Link>
              )}
              <div className="hidden md:block">
                <button
                  onClick={handleClick}
                  className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 hover:text-white transition duration-300"
                >
                  Log out
                </button>
              </div>
            </>
          )}
          {!user && (
            <div className="hidden md:block">
              <Link
                to="/login"
                className="text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
              >
                Login
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

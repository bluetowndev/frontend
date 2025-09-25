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
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-2xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
      
      <div className="container max-w-[1400px] mx-auto p-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
              <div className="relative">
                <img
                  src="./bluetown_logo.svg"
                  alt="BlueTown Logo"
                  className="h-12 w-12 mr-3 ml-2 transition-transform duration-300 group-hover:rotate-12"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  BlueTown
                </h1>
                <p className="text-xs text-blue-200 opacity-80 hidden sm:block">WorkTrack System</p>
              </div>
            </Link>
            
            {/* Mobile Logout Button */}
            <div className="md:hidden">
              {user ? (
                <button
                  onClick={handleClick}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Log out
                </button>
              ) : null}
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
            {user && (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-white">
                    <div className="font-semibold text-sm">{user.email}</div>
                    <div className="text-xs text-blue-200 opacity-80 capitalize">{user.role} Account</div>
                  </div>
                </div>

                {/* Role-based Navigation */}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin-dashboard" 
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Admin Panel
                  </Link>
                )}

                {/* Desktop Logout Button */}
                <div className="hidden md:block">
                  <button
                    onClick={handleClick}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log out</span>
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Status Indicator */}
        {user && (
          <div className="mt-3 flex items-center justify-center md:justify-end">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-200 text-xs font-medium">Online</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

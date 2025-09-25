import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import GeminiWave from "../components/sync/GeminiWave";
import GradientShineButton from "../components/sync/GradientShineButton";
import TypingEffect from "../components/sync/TypingEffect";
import HorizontalCards from "../components/HorizontalCard"; // Import the HorizontalCards component

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <GeminiWave />
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 left-1/4 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col w-full items-center justify-center min-h-screen space-y-8 p-4 lg:flex-row lg:space-y-0">

        {/* Branding Section - Mobile */}
        <div className="flex flex-col items-center lg:hidden w-full mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-3xl">🏢</span>
            </div>
          </div>
          <h1
            className="text-4xl font-bold text-white pb-3 text-center bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            WORKTRACK
          </h1>
          <TypingEffect
            text="Simplifying Field Work"
            className="text-xl font-semibold text-blue-200 text-center"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          />
        </div>

        {/* Branding Section - Desktop */}
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:w-1/2 lg:min-h-screen lg:pr-8">
          <div className="text-center space-y-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl transform scale-150"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                <span className="text-6xl">🏢</span>
              </div>
            </div>
            <h1
              className="text-7xl font-bold text-white pb-5 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              WORKTRACK
            </h1>
            <TypingEffect
              text="Simplifying Field Work"
              className="text-3xl lg:text-4xl font-bold text-blue-200"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            />
            <div className="mt-8 space-y-4 text-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time attendance tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>GPS-enabled location services</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Comprehensive reporting dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="relative z-10 w-full max-w-md lg:max-w-lg xl:max-w-xl p-8 m-5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 lg:w-1/2">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your WorkTrack dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="w-full p-4 pl-12 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <GradientShineButton
                type="submit"
                disabled={isLoading}
                sx={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                text={isLoading ? "Signing in..." : "Sign in"}
              />
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="text-red-500 text-xl">⚠️</div>
                  <div className="text-red-700 font-medium">{error}</div>
                </div>
              </div>
            )}
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-lg mt-0.5">🔒</div>
              <div>
                <h4 className="text-blue-800 font-semibold text-sm">Secure Login</h4>
                <p className="text-blue-700 text-sm">Your credentials are encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice Section */}
      <div className="w-full mt-10 pb-8 px-4 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2
                className="text-3xl font-bold text-red-600 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Important Notice
              </h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-gray-700 text-lg leading-relaxed">
                  This is to inform you all that, it is <span className="font-bold text-red-600">mandatory to mark check-in before 10:30 AM</span>. If not, that day will be considered as a half day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Section */}
      <div className="w-full pb-8 px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2
              className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Today's Compliance Overview
            </h2>
            <p className="text-blue-200 text-lg">Real-time attendance monitoring across all locations</p>
          </div>
          
          <HorizontalCards />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full pb-4 px-4 relative z-20">
        <div className="text-center">
          <p className="text-blue-200/80 text-sm">
            © 2024 BlueTown Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
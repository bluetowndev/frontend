import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// pages & components
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import { Toaster } from 'react-hot-toast';
import StateheadDashboard from "./pages/StateheadDashboard";
import Dashboard from "./pages/Dahboard"; // Import the new Dashboard page

function App() {
  const { user } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
        <Toaster />
        <Navbar />

        {/* Main content area */}
        <div className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  user.role === "admin" ? (
                    <Navigate to="/admin-dashboard" />
                  ) : user.role === "statehead" ? (
                    <Navigate to="/statehead-dashboard" />
                  ) : (
                    <Home />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={
                user && user.role === "admin" ? <Signup /> : <Navigate to="/" />
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                user && user.role === "admin" ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/statehead-dashboard"
              element={
                user && user.role === "statehead" ? (
                  <StateheadDashboard />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard />} // Add the new route for Dashboard
            />
          </Routes>
        </div>

        {/* Footer component stays at the bottom */}
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

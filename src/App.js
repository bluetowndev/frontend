import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// pages & components
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import RequestPasswordReset from "./pages/RequestPassword";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from 'react-hot-toast';

function App() {
  const { user } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
      <Toaster/>
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  user.role === "admin" ? (
                    <Navigate to="/admin-dashboard" />
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
              path="/request-password-reset"
              element={!user ? <RequestPasswordReset /> : <Navigate to="/" />}
            />
            <Route
              path="/reset-password/:token"
              element={!user ? <ResetPassword /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import Error from "./pages/Error"; // Import the ServerErrorPage component

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
        <Toaster />
        <Navbar />

        {/* Main content area */}
        <div className="flex-grow">
          <Routes>
            {/* Display the ServerErrorPage on the "/" route */}
            <Route path="/" element={<Error />} />

            {/* Commented out existing routes */}
            {/*
            <Route
              path="/"
              element={
                user ? (
                  user.role === "admin" ? (
                    <Navigate to="/admin-dashboard" />
                  ) : user.role === "statehead" ? (
                    <Navigate to="/statehead-dashboard" />
                  ) : user.role === "dashboard" ? (
                    <Navigate to="/dashboard" />
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
              element={
                user && user.role === "dashboard" ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            */}
          </Routes>
        </div>

        {/* Footer component stays at the bottom */}
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
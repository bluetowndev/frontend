import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAttendance } from "../hooks/useAttendance";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

const Camera = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [feedback, setFeedback] = useState(""); 
  const [selectedOption, setSelectedOption] = useState(""); // New state for dropdown
  const { markAttendance, isLoading, error } = useAttendance();
  const navigate = useNavigate();
  const [isCameraOpen, setIsCameraOpen] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageSrc(imageSrc);
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))._id;
      await markAttendance(imageSrc, location, userId, selectedOption, feedback); // Include selectedOption

      // Reset image source and turn off the camera
      setImageSrc(null);
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
        webcamRef.current.video.srcObject.getTracks().forEach((track) => track.stop());
      }

      // Close the camera component
      setIsCameraOpen(false);

      // Navigate to home page
      // toast.success("Attendance submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = () => {
    setIsCameraOpen(false);
    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
      webcamRef.current.video.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    isCameraOpen && (
      <div className="flex flex-col items-start bg-gray-200 p-4 rounded-lg relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
        >
          &times;
        </button>
        {!imageSrc && (
          <div className="flex flex-col items-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="mb-4"
            />
            <button
              onClick={captureImage}
              className="bg-indigo-600 text-white p-2 rounded-lg"
            >
              Click
            </button>
          </div>
        )}
        {imageSrc && (
          <div className="ml-4">
            <h3>Captured Image:</h3>
            <img src={imageSrc} alt="Captured" className="mt-2 rounded-lg" />
            
            {/* Dropdown field */}
            <label htmlFor="options" className="mt-4 block text-gray-700">Select the Purpose of Visit:</label>
            <select
              id="options"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded-lg"
            >
              <option value="" disabled>Select an option</option>
              <option value="Site Visit">Site Visit</option>
              <option value="BSNL Office Visit">BSNL Office Visit</option>
              <option value="BT Office Visit">BT Office Visit</option>
              <option value="New Site Survey">New Site Survey</option>
              <option value="Official Tour - Out of Station">Official Tour - Out of Station</option>
              <option value="New Business Generation - Client Meeting">New Business Generation - Client Meeting</option>
              <option value="Existing Client Meeting">Existing Client Meeting</option>
              <option value="Check In">Check In</option>
              <option value="Check Out">Check Out</option>
              <option value="On Leave">On Leave</option>
              <option value="Others">Others</option>
            </select>

            {/* Feedback text box */}
            <label htmlFor="feedback" className="mt-4 block text-gray-700">Optional Feedback (max 50 characters):</label>
            <input
              type="text"
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 50))} // Limit to 50 characters
              className="mt-2 p-2 border border-gray-300 rounded-lg"
              placeholder="Enter feedback"
            />

            

            <button
              onClick={handleSubmit}
              className={`bg-red-600 text-white p-2 ml-2 rounded-lg mt-4 ${
                isLoading && "opacity-50 cursor-not-allowed"
              }`}
              disabled={isLoading || !selectedOption} // Disable if no option selected
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}
        {error && (
          <div className="error mt-4 p-2 bg-red-100 text-red-700 border border-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
    )
  );
};

export default Camera;

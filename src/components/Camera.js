import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAttendance } from "../hooks/useAttendance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Camera = ({ onClose }) => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [feedback, setFeedback] = useState("");
  const [selectedOption, setSelectedOption] = useState(""); // Purpose of visit
  const [selectedSubPurpose, setSelectedSubPurpose] = useState(""); // Sub-purpose of visit
  const { markAttendance, isLoading, error } = useAttendance();
  const navigate = useNavigate();
  const [isCameraOpen, setIsCameraOpen] = useState(true);

  const mandatoryFeedbackOptions = [
    "BSNL Office Visit",
    "New Site Survey",
    "Official Tour - Out of Station",
    "New Business Generation - Client Meeting",
  ];

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
      if (
        mandatoryFeedbackOptions.includes(selectedOption) &&
        feedback.trim() === ""
      ) {
        toast.error("Details are required for the selected purpose of visit.");
        return;
      }

      if (selectedOption === "Site Visit" && !selectedSubPurpose) {
        toast.error("Please select a sub-purpose for Site Visit.");
        return;
      }

      const userId = JSON.parse(localStorage.getItem("user"))._id;
      await markAttendance(
        imageSrc,
        location,
        userId,
        selectedOption,
        feedback,
        selectedSubPurpose // Include sub-purpose
      );

      setImageSrc(null);
      setIsCameraOpen(false);
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.srcObject
      ) {
        webcamRef.current.video.srcObject.getTracks().forEach((track) =>
          track.stop()
        );
      }
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = () => {
    setIsCameraOpen(false);
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.srcObject
    ) {
      webcamRef.current.video.srcObject.getTracks().forEach((track) =>
        track.stop()
      );
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

            {/* Dropdown for purpose of visit */}
            <label
              htmlFor="options"
              className="mt-4 block text-gray-700"
            >
              Select the Purpose of Visit:
            </label>
            <select
              id="options"
              value={selectedOption}
              onChange={(e) => {
                setSelectedOption(e.target.value);
                setSelectedSubPurpose(""); // Reset sub-purpose when main purpose changes
              }}
              className="mt-2 p-2 border border-gray-300 rounded-lg"
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="Check In">Check In</option>
              <option value="Site Visit">Existing Site Visit</option>
              <option value="BSNL Office Visit">BSNL Office Visit</option>
              <option value="BT Office Visit">BT Office Visit</option>
              <option value="New Site Survey">New Site Survey</option>
              <option value="Official Tour - Out of Station">
                Official Tour - Out of Station
              </option>
              <option value="New Business Generation - Client Meeting">
                New Business Generation - Client Meeting
              </option>
              <option value="Existing Client Meeting">
                Existing Client Meeting
              </option>
              <option value="Preventive Measures">
                Preventive Site Visit
              </option>
              <option value="On Leave">On Leave</option>
              <option value="Others">Others</option>
              <option value="Check Out">Check Out</option>
            </select>

            {/* Sub-purpose for Existing Site Visit */}
            {selectedOption === "Site Visit" && (
              <>
                <label
                  htmlFor="sub-purpose"
                  className="mt-4 block text-gray-700"
                >
                  Select Sub-Purpose:
                </label>
                <select
                  id="sub-purpose"
                  value={selectedSubPurpose}
                  onChange={(e) => setSelectedSubPurpose(e.target.value)}
                  className="mt-2 p-2 border border-gray-300 rounded-lg"
                >
                  <option value="" disabled>
                    Select a sub-purpose
                  </option>
                  <option value="Near End">Near End</option>
                  <option value="Far End">Far End</option>
                </select>
              </>
            )}

            {/* Feedback text box */}
            <label
              htmlFor="feedback"
              className="mt-4 block text-gray-700"
            >
              Details (max 50 characters):
            </label>
            <input
              type="text"
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 50))}
              className="mt-2 p-2 border border-gray-300 rounded-lg"
              placeholder="Enter Details"
            />

            <button
              onClick={handleSubmit}
              className={`bg-red-600 text-white p-2 ml-2 rounded-lg mt-4 ${
                isLoading && "opacity-50 cursor-not-allowed"
              }`}
              disabled={isLoading || !selectedOption}
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

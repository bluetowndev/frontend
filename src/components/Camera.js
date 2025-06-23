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
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedSubPurpose, setSelectedSubPurpose] = useState("");
  const [previousSiteVisit, setPreviousSiteVisit] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [summarySubmitted, setSummarySubmitted] = useState(false);
  const { markAttendance, isLoading, error } = useAttendance();
  const navigate = useNavigate();
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [isFirstEntry, setIsFirstEntry] = useState(true); // State to track the first entry of the day

  const apiUrl = process.env.REACT_APP_API_URL || '';

  const token = JSON.parse(localStorage.getItem('user')).token;
  const userState = JSON.parse(localStorage.getItem('user')).state; // Get the user's state

  const mandatoryFeedbackOptions = [
    "BSNL Office Visit",
    "New Site Survey",
    "Official Tour - Out of Station",
    "NEW BUSINESS OPPORTUNITY - FIRST MEETING",
  ];

  const purposes = [
    "Check In",
    "Site Visit",
    "BSNL Office Visit",
    "BT Office Visit",
    "New Site Survey",
    "Official Tour - Out of Station",
    "NEW BUSINESS OPPORTUNITY - FIRST MEETING",
    "BUSINESS DEVELOPMENT- FOLLOW UP MEETING",
    "Existing Client Meeting",
    "Preventive Measures",
    "On Leave",
    "Others",
    "Check Out",
  ];

  const towerEndIssues = [
    "Router Faulty",
    "Radio Faulty",
    "Media Issue",
    "BSNL Power Issue",
    "Adapter Faulty",
    "CAT6 Cable Faulty",
    "Others"
  ];

  const customerEndIssues = [
    "Router Faulty",
    "Radio Faulty",
    "Desktop Switch Faulty",
    "POE Switch Faulty",
    "AP Faulty",
    "Media Issue",
    "BT Fiber Cut",
    "Adapter Faulty",
    "CAT6 Cable Faulty",
    "Preventive Maintenance",
    "Customer Complaint",
    "MSO- OFC Cut(Media Issue)",
    "MSO ONU Faulty(Media Issue)",
    "Others"
  ];

  const getPurposes = () => {
    // if (userState === "Delhi") {
    //   return ["Work from Home", "Week Off"];
    // }
    if (isFirstEntry) {
      return ["Check In", "On Leave"];
    }
    return purposes.filter((purpose) => purpose !== "Check In" && purpose !== "On Leave");
  };

  useEffect(() => {
    // Check if it's the user's first entry of the day
    const checkFirstEntry = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/attendance/first-entry`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`, // Include token for authentication
          },
        });

        const data = await response.json();

        if (response.ok) {
          setIsFirstEntry(data.isFirstEntry); // Use the `isFirstEntry` flag from the backend response
        } else {
          toast.error(data.error || "Failed to check entry status.");
        }
      } catch (error) {
        console.error("Error checking first entry:", error);
        toast.error("Unable to determine entry status.");
      }
    };

    checkFirstEntry();

    const checkPreviousSiteVisit = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/attendance/last-site-visit`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setPreviousSiteVisit(data);
      } catch (error) {
        console.error('Error checking previous site visit:', error);
      }
    };

    checkPreviousSiteVisit();

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

  const saveSiteVisitSummary = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/attendance/site-visit-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attendanceId: previousSiteVisit.attendanceId,
          issue: selectedIssue
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save site visit summary');
      }

      // Update the previousSiteVisit state to include summarySubmitted
      setPreviousSiteVisit(prev => ({
        ...prev,
        summarySubmitted: true
      }));
      
      toast.success('Site visit summary saved successfully');
    } catch (error) {
      console.error('Error saving site visit summary:', error);
      toast.error('Failed to save site visit summary');
    }
  };

  const handleSubmitSummary = async (e) => {
    e.preventDefault();
    if (!selectedIssue) {
      toast.error("Please select the last visit purpose");
      return;
    }
    await saveSiteVisitSummary();
  };

  const handleSubmit = async () => {
    try {
      if (mandatoryFeedbackOptions.includes(selectedOption) && feedback.trim() === "") {
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
        selectedSubPurpose
      );

      setImageSrc(null);
      setIsCameraOpen(false);
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
        webcamRef.current.video.srcObject.getTracks().forEach((track) => track.stop());
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

  // Show summary form if there's a previous site visit and summary hasn't been submitted
  if (previousSiteVisit?.hasPreviousSiteVisit && !previousSiteVisit.summarySubmitted) {
    return (
      <div className="flex flex-col items-start bg-gray-200 p-6 rounded-lg relative w-full max-w-md mx-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
        >
          &times;
        </button>
        
        <div className="w-full p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Previous Site Visit Summary Required</h3>
          <p className="mb-4">Please provide details about your previous {previousSiteVisit.visitType} visit before proceeding.</p>
          
          <form onSubmit={handleSubmitSummary} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select last visit purpose:
              </label>
              <select
                value={selectedIssue}
                onChange={(e) => setSelectedIssue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select last visit purpose</option>
                {previousSiteVisit.visitType === "Tower End (TE)"
                  ? towerEndIssues.map((issue) => (
                      <option key={issue} value={issue}>
                        {issue}
                      </option>
                    ))
                  : customerEndIssues.map((issue) => (
                      <option key={issue} value={issue}>
                        {issue}
                      </option>
                    ))}
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Submit Summary
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show camera and main form only after summary is submitted or if no previous site visit
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
            <label htmlFor="options" className="mt-4 block text-gray-700">
              Select the Purpose of Visit:
            </label>
            <select
              id="options"
              value={selectedOption}
              onChange={(e) => {
                setSelectedOption(e.target.value);
                setSelectedSubPurpose("");
              }}
              className="mt-2 p-2 border border-gray-300 rounded-lg"
            >
              <option value="" disabled>
                Select an option
              </option>
              {getPurposes().map((purpose) => (
                <option
                  key={purpose}
                  value={purpose}
                  style={
                    purpose === "NEW BUSINESS OPPORTUNITY - FIRST MEETING" ||
                      purpose === "BUSINESS DEVELOPMENT- FOLLOW UP MEETING"
                      ? { fontWeight: "bold" }
                      : {}
                  }
                >
                  {purpose}
                </option>
              ))}
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
                  <option value="Customer End (CE)">Customer End (CE)</option>
                  <option value="Tower End (TE)">Tower End (TE)</option>
                </select>
              </>
            )}

            {/* Feedback text box */}
            <label htmlFor="feedback" className="mt-4 block text-gray-700">
              Details (max 50 characters):
            </label>
            <input
              type="text"
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 200))}
              className="mt-2 p-2 border border-gray-300 rounded-lg"
              placeholder="Enter Details"
            />

            <button
              onClick={handleSubmit}
              className={`bg-red-600 text-white p-2 ml-2 rounded-lg mt-4 ${isLoading && "opacity-50 cursor-not-allowed"
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
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

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
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

      if (response.ok) {
        setSummarySubmitted(true);
        toast.success('Site visit summary submitted successfully');
        setPreviousSiteVisit(prev => ({ ...prev, summarySubmitted: true }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit summary');
      }
    } catch (error) {
      console.error('Error submitting summary:', error);
      toast.error('Error submitting summary');
    }
  };

  const handleSubmitSummary = async (e) => {
    e.preventDefault();
    await saveSiteVisitSummary();
  };

  const handleSubmit = async () => {
    try {
      if (!location.lat || !location.lng) {
        toast.error("Please allow location access to mark attendance.");
        return;
      }

      if (!selectedOption) {
        toast.error("Please select a purpose for your visit.");
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
    onClose();
  };

  // Show summary form if there's a previous site visit and summary hasn't been submitted
  if (previousSiteVisit?.hasPreviousSiteVisit && !previousSiteVisit.summarySubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative transform transition-all">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition-colors"
          >
            ×
          </button>
          
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Site Visit Summary Required</h3>
              <p className="text-gray-600">Please provide details about your previous {previousSiteVisit.visitType} visit before proceeding.</p>
            </div>
            
            <form onSubmit={handleSubmitSummary} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select last visit purpose:
                </label>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Submit Summary
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show camera and main form only after summary is submitted or if no previous site visit
  return (
    isCameraOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition-colors z-10"
          >
            ×
          </button>

          <div className="p-8">
            {!imageSrc ? (
              // Camera View
              <div className="text-center">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Mark Attendance</h2>
                  <p className="text-gray-600">Position yourself in the frame and click capture</p>
                </div>
                
                <div className="relative inline-block rounded-2xl overflow-hidden shadow-2xl mb-6">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full max-w-md"
                  />
                  <div className="absolute inset-0 border-4 border-blue-500/30 rounded-2xl pointer-events-none"></div>
                </div>
                
                <button
                  onClick={captureImage}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Capture Photo</span>
                </button>
              </div>
            ) : (
              // Form View
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Preview */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Captured Image</h3>
                  <div className="relative">
                    <img src={imageSrc} alt="Captured" className="w-full rounded-xl shadow-lg" />
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ Ready
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">Attendance Details</h3>
                  
                  {/* Purpose Selection */}
                  <div>
                    <label htmlFor="options" className="block text-sm font-semibold text-gray-700 mb-3">
                      Purpose of Visit *
                    </label>
                    <select
                      id="options"
                      value={selectedOption}
                      onChange={(e) => {
                        setSelectedOption(e.target.value);
                        setSelectedSubPurpose("");
                      }}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>
                        Select purpose
                      </option>
                      {getPurposes().map((purpose) => (
                        <option
                          key={purpose}
                          value={purpose}
                          className={
                            purpose === "NEW BUSINESS OPPORTUNITY - FIRST MEETING" ||
                            purpose === "BUSINESS DEVELOPMENT- FOLLOW UP MEETING"
                              ? "font-bold"
                              : ""
                          }
                        >
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-purpose for Site Visit */}
                  {selectedOption === "Site Visit" && (
                    <div>
                      <label htmlFor="sub-purpose" className="block text-sm font-semibold text-gray-700 mb-3">
                        Sub-Purpose *
                      </label>
                      <select
                        id="sub-purpose"
                        value={selectedSubPurpose}
                        onChange={(e) => setSelectedSubPurpose(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="" disabled>
                          Select sub-purpose
                        </option>
                        <option value="Customer End (CE)">Customer End (CE)</option>
                        <option value="Tower End (TE)">Tower End (TE)</option>
                      </select>
                    </div>
                  )}

                  {/* Feedback */}
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-3">
                      Details (max 200 characters)
                    </label>
                    <textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value.slice(0, 200))}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter additional details..."
                      rows={3}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {feedback.length}/200
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setImageSrc(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all"
                    >
                      Retake Photo
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !selectedOption}
                      className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${(isLoading || !selectedOption) && "opacity-50 cursor-not-allowed"}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Submit Attendance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="text-red-500 text-xl">⚠️</div>
                  <div className="text-red-700">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Camera;
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAttendance } from "../hooks/useAttendance";
import Modal from "./Modal";
import { toast } from "react-hot-toast";

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { fetchAttendanceByDate } = useAttendance();
  const apiUrl = process.env.REACT_APP_API_URL || "";

  const handleDateClick = async (date) => {
    const formattedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      .toISOString()
      .split("T")[0];
    setSelectedDate(formattedDate);

    const data = await fetchAttendanceByDate(formattedDate);
    console.log('Attendance data received:', data);
    console.log('Distance data in attendance:', data.map(a => ({ 
      purpose: a.purpose, 
      distanceFromPrevious: a.distanceFromPrevious,
      location: a.location 
    })));
    setAttendanceData(data);
    setShowModal(true);

    // Automatically save distance when data is loaded
    if (data && data.length > 0) {
      await autoSaveDistance(data, formattedDate);
    }
  };

  const convertToIST = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return date.toLocaleTimeString("en-IN", options);
  };

  const calculateCallTime = (attendanceData) => {
    if (attendanceData.length < 2) return [];

    return attendanceData.map((attendance, index) => {
      if (index === 0) return null;

      const previousTimestamp = new Date(attendanceData[index - 1].timestamp);
      const currentTimestamp = new Date(attendance.timestamp);

      const durationInMinutes = Math.floor((currentTimestamp - previousTimestamp) / 60000);

      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;

      return `${hours > 0 ? `${hours} hr ` : ""}${minutes} min`;
    });
  };

  const calculateDistances = (attendanceData) => {
    if (attendanceData.length < 2) return [];

    return attendanceData.map((attendance, index) => {
      if (index === 0) return null;

      let distance = attendance.distanceFromPrevious || "0 m";
      
      // Handle cases where distanceFromPrevious might be null, undefined, or empty
      if (!distance || distance === "N/A" || distance === "null" || distance === "undefined") {
        distance = "0 m";
      }
      
      // Parse the distance string
      let numericDistance = 0;
      if (typeof distance === "string") {
        if (distance.includes("km")) {
          numericDistance = parseFloat(distance.replace(" km", "")) || 0;
        } else if (distance.includes("m")) {
          numericDistance = (parseFloat(distance.replace(" m", "")) || 0) / 1000;
        } else {
          // Try to parse as a number
          numericDistance = parseFloat(distance) || 0;
        }
      } else if (typeof distance === "number") {
        numericDistance = distance;
      }
      
      return numericDistance;
    });
  };

  const calculateTotalDistance = (attendanceData) => {
    const totalMeters = attendanceData.reduce((total, attendance) => {
      let distance = attendance.distanceFromPrevious || "0 m";

      // Handle cases where distanceFromPrevious might be null, undefined, or empty
      if (!distance || distance === "N/A" || distance === "null" || distance === "undefined") {
        distance = "0 m";
      }

      let numericDistance = 0;
      if (typeof distance === "string") {
        if (distance.includes("km")) {
          numericDistance = (parseFloat(distance.replace(" km", "")) || 0) * 1000;
        } else if (distance.includes("m")) {
          numericDistance = parseFloat(distance.replace(" m", "")) || 0;
        } else {
          // Try to parse as a number
          numericDistance = parseFloat(distance) || 0;
        }
      } else if (typeof distance === "number") {
        numericDistance = distance;
      }

      return total + numericDistance;
    }, 0);

    return totalMeters / 1000;
  };

  const autoSaveDistance = async (data, date) => {
    try {
      const totalDistance = calculateTotalDistance(data);
      const pointToPointDistances = data
        .map((attendance, index) => {
          if (index === 0) return null;

          const distance = calculateDistances(data)[index];
          const transitTime = calculateCallTime(data)[index];

          return {
            from: data[index - 1].locationName || "Unknown",
            to: attendance.locationName || "Unknown",
            distance,
            transitTime,
          };
        })
        .filter(Boolean);

      const payload = {
        date: date,
        totalDistance,
        pointToPointDistances,
      };

      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.token;

      if (!token) return;

      await fetch(`${apiUrl}/api/attendance/save-total-distance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error auto-saving distance:", error);
      // Silent failure - don't show error to user for auto-save
    }
  };

  const saveDataToDB = async () => {
    const totalDistance = calculateTotalDistance(attendanceData);
    const pointToPointDistances = attendanceData
      .map((attendance, index) => {
        if (index === 0) return null;

        const distance = calculateDistances(attendanceData)[index];
        const transitTime = calculateCallTime(attendanceData)[index];

        return {
          from: attendanceData[index - 1].locationName || "Unknown",
          to: attendance.locationName || "Unknown",
          distance,
          transitTime,
        };
      })
      .filter(Boolean);

    const payload = {
      date: selectedDate,
      totalDistance,
      pointToPointDistances,
    };

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.token;

      const response = await fetch(`${apiUrl}/api/attendance/save-total-distance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Data verified  successfully!");
      } else {
        const errorData = await response.json()
        toast.error(`Failed to verify data: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("An error occurred while saving data.");
    }
  };

  return (
    <>
      <div className="flex mx-2">
        <div className="w-full flex flex-col items-center p-2 bg-white rounded-md">
          <Calendar className="w-full p-5" onClickDay={handleDateClick} />
        </div>
      </div>

      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        title={`WorkTrack for ${selectedDate}`}
        desc={
          attendanceData.length > 0 ? (
            <>
              {attendanceData.map((attendance, index) => (
                <div key={attendance._id} className="border p-2 mb-2">
                  <p>
                    <b>
                      Purpose: {attendance.purpose} ({String.fromCharCode(65 + index)})
                    </b>
                  </p>
                  <p>Time: {convertToIST(attendance.timestamp)}</p>
                  <p>Latitude: {attendance.location.lat}</p>
                  <p>Longitude: {attendance.location.lng}</p>
                  <p>Location: {attendance.locationName || "Loading..."}</p>
                  {index > 0 && (
                    <>
                      <p>
                        <b>Transit Time:</b> {calculateCallTime(attendanceData)[index] || "N/A"}
                      </p>
                      <p>
                        <b>Transit Distance:</b>{" "}
                        {(() => {
                          const distance = calculateDistances(attendanceData)[index];
                          if (distance && distance > 0) {
                            return `${distance.toFixed(2)} km`;
                          } else if (distance === 0) {
                            return "0.00 km";
                          } else {
                            return "N/A";
                          }
                        })()}
                      </p>
                    </>
                  )}

                  {/* Sub-purpose for site visits */}
                  {attendance.purpose === "Site Visit" && attendance.subPurpose && (
                    <p className="text-sm text-gray-600">
                      <b>Sub-Purpose:</b> {attendance.subPurpose}
                    </p>
                  )}

                  <img
                    src={attendance.image}
                    alt="Attendance"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                </div>
              ))}
              <div className="border-t mt-4 pt-2 text-center">
                <b className="block text-lg mb-4">
                  Total Distance: {calculateTotalDistance(attendanceData).toFixed(2)} km
                </b>
                <button
                  onClick={saveDataToDB}
                  className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 mt-4"
                >
                  Verify record
                </button>
              </div>
            </>
          ) : (
            <p>No worktrack for this date.</p>
          )
        }
      />

    </>
  );
};

export default CalendarView;

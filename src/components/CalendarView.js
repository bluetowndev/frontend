import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAttendance } from "../hooks/useAttendance";
import Modal from "./Modal";

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { fetchAttendanceByDate } = useAttendance();

  const handleDateClick = async (date) => {
    const formattedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      .toISOString()
      .split("T")[0];
    setSelectedDate(formattedDate);

    const data = await fetchAttendanceByDate(formattedDate);
    setAttendanceData(data);
    setShowModal(true);

    // Automatically calculate and save the total distance
    // if (data.length > 0) {
    //   calculateAndSaveTotalDistance(data, formattedDate);
    // }
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

  const calculateTotalDistance = (attendanceData) => {
    const totalMeters = attendanceData.reduce((total, attendance) => {
      let distance = attendance.distanceFromPrevious || "0 m";

      if (distance.includes("km")) {
        distance = parseFloat(distance) * 1000;
      } else if (distance.includes("m")) {
        distance = parseFloat(distance);
      }

      return total + distance; // Accumulate the total in meters
    }, 0);

    const totalKilometers = totalMeters / 1000; // Convert meters to kilometers
    return totalKilometers; // Return numeric value in kilometers
  };

  // const calculateAndSaveTotalDistance = async (attendanceData, date) => {
  //   try {
  //     const userData = JSON.parse(localStorage.getItem("user"));
  //     const token = userData?.token;

  //     if (!token) {
  //       toast.error("User not authenticated!");
  //       return;
  //     }

  //     const totalDistance = calculateTotalDistance(attendanceData); // Numeric distance in kilometers

  //     const response = await fetch(`${apiUrl}/api/attendance/save-total-distance`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         date,
  //         totalDistance, // Send numeric distance in km
  //       }),
  //     });

  //     if (response.ok) {
  //       toast.success("Total distance saved successfully!");
  //     } else {
  //       const error = await response.json();
  //       toast.error(error.message || "Failed to save total distance.");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to save total distance.");
  //   }
  // };

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
              {attendanceData.map((attendance) => (
                <div key={attendance._id} className="border p-2 mb-2">
                  <b>Purpose: {attendance.purpose}</b>
                  <p>Time: {convertToIST(attendance.timestamp)}</p>
                  <p>Latitude: {attendance.location.lat}</p>
                  <p>Longitude: {attendance.location.lng}</p>
                  <p>Location: {attendance.locationName || "Loading..."}</p>
                  <img
                    src={attendance.image}
                    alt="Attendance"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                </div>
              ))}
              <div className="border-t mt-4 pt-2 text-center">
                <b className="block text-lg mb-4">
                  Total Distance: {calculateTotalDistance(attendanceData)} km
                </b>
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

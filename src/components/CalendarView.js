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
      if (index === 0) return null; // No call time for the first entry

      const previousTimestamp = new Date(attendanceData[index - 1].timestamp);
      const currentTimestamp = new Date(attendance.timestamp);

      const durationInMinutes = Math.floor((currentTimestamp - previousTimestamp) / 60000); // Difference in minutes

      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;

      return `${hours > 0 ? `${hours} hr ` : ""}${minutes} min`;
    });
  };

  const calculateDistances = (attendanceData) => {
    if (attendanceData.length < 2) return [];

    return attendanceData.map((attendance, index) => {
      if (index === 0) return null; // No distance for the first entry

      let distance = attendance.distanceFromPrevious || "0 m";
      if (distance.includes("km")) {
        distance = parseFloat(distance) * 1000; // Convert to meters
      } else if (distance.includes("m")) {
        distance = parseFloat(distance);
      }
      return distance / 1000; // Return distance in kilometers
    });
  };

  const generateLabels = (attendanceData) => {
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return attendanceData.map((_, index) => labels[index] || String.fromCharCode(65 + index));
  };

  const callTimes = calculateCallTime(attendanceData);
  const distances = calculateDistances(attendanceData);
  const labels = generateLabels(attendanceData);

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

  const totalDistance = calculateTotalDistance(attendanceData);

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
                    <b>Purpose: {attendance.purpose} ({labels[index]})</b>
                  </p>
                  <p>Time: {convertToIST(attendance.timestamp)}</p>
                  <p>Latitude: {attendance.location.lat}</p>
                  <p>Longitude: {attendance.location.lng}</p>
                  <p>Location: {attendance.locationName || "Loading..."}</p>
                  {index > 0 && (
                    <>
                      <p>
                        <b>Transit Time:</b> {callTimes[index] ? callTimes[index] : "N/A"} (
                        {labels[index - 1]} → {labels[index]})
                      </p>
                      <p>
                        <b>Transit Distance:</b>{" "}
                        {distances[index] ? `${distances[index]} km` : "N/A"} (
                        {labels[index - 1]} → {labels[index]})
                      </p>
                    </>
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
                  Total Distance: {totalDistance.toFixed(2)} km
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

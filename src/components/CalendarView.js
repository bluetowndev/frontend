import React, { useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { useAttendance } from '../hooks/useAttendance';
import Modal from './Modal';

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { fetchAttendanceByDate } = useAttendance();

  const handleDateClick = async (date) => {
    const formattedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
    setSelectedDate(formattedDate);

    const data = await fetchAttendanceByDate(formattedDate);
    setAttendanceData(data);
    setShowModal(true);
  };

  const convertToIST = (timestamp) => {
    const date = new Date(timestamp);
    const options = { timeZone: 'Asia/Kolkata', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return date.toLocaleTimeString('en-IN', options);
  };

  const calculateTotalDistance = () => {
    const totalMeters = attendanceData.reduce((total, attendance) => {
      let distance = attendance.distanceFromPrevious || "0 m";
  
      if (distance.includes("km")) {
        distance = parseFloat(distance) * 1000;
      } else if (distance.includes("m")) {
        distance = parseFloat(distance);
      }
  
      return total + distance;
    }, 0);

    const kilometers = Math.floor(totalMeters / 1000);
    const meters = totalMeters % 1000;

    return `${kilometers > 0 ? `${kilometers} km ` : ""}${meters} m`;
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
              {attendanceData.map((attendance) => (
                <div key={attendance._id} className="border p-2 mb-2">
                  <b>Purpose: {attendance.purpose}</b>
                  <p>Time: {convertToIST(attendance.timestamp)}</p>
                  <p>Latitude: {attendance.location.lat}</p>
                  <p>Longitude: {attendance.location.lng}</p>
                  <p>Location: {attendance.locationName || "Loading..."}</p>
                  {/* {attendance.distanceFromPrevious && (
                    <p>Distance from previous: {attendance.distanceFromPrevious}</p>
                  )} */}
                  <img src={attendance.image} alt="Attendance" className="mt-2 w-32 h-32 object-cover rounded" />
                </div>
              ))}
              <div className="border-t mt-4 pt-2">
                <b>Total Distance: {calculateTotalDistance()}</b>
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

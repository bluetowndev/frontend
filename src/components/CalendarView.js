import React, { useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import the styles for the calendar
import { useAttendance } from '../hooks/useAttendance';
import Modal from './Modal'; // Import the Modal component

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // const [locationNames, setLocationNames] = useState({});
  // const { fetchAttendanceByDate } = useAttendance();
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
            attendanceData.map((attendance) => (
              <div key={attendance._id} className="border p-2 mb-2">
                <b>Purpose: {attendance.purpose}</b>
                <p>Time: {convertToIST(attendance.timestamp)}</p>
                <p>Latitude: {attendance.location.lat}</p>
                <p>Longitude: {attendance.location.lng}</p>
                <p>Location: {attendance.locationName || "Loading..."}</p>
                {/* <p>Location: {locationNames[`${attendance.location.lat},${attendance.location.lng}`] || "Loading..."}</p> */}
                {attendance.distanceFromPrevious && (
                  <p>Distance from previous: {attendance.distanceFromPrevious}</p>
                )}
                <img src={attendance.image} alt="Attendance" className="mt-2 w-32 h-32 object-cover rounded" />
              </div>
            ))
          ) : (
            <p>No worktrack for this date.</p> 
          )
        }
      />
    </>
  );
};

export default CalendarView;

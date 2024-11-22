import React, { useEffect, useRef } from "react";
import LineChart from "../components/Chart";
import HorizentalGraph from "../components/HorizentalGraph";
import Jumbotron from "../components/Jumbotron";
import Sidebar from "../components/SideBar";
import CalendarView from "../components/CalendarView";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAttendance } from "../hooks/useAttendance";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useAuthContext();
  const { fetchAttendanceByDate } = useAttendance();
  const apiUrl = process.env.REACT_APP_API_URL || "";

  const isDistanceSaved = useRef(false); // Track if saveTodayDistance has been called

  useEffect(() => {
    const saveTodayDistance = async () => {
      try {
        // Get today's date in IST
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        const istDate = new Date(now.getTime() + istOffset);

        // Format IST date to YYYY-MM-DD
        const formattedDate = istDate.toISOString().split("T")[0];

        // Fetch attendance data for today
        const attendanceData = await fetchAttendanceByDate(formattedDate);

        if (attendanceData.length > 0) {
          // Calculate and save the total distance for today
          await calculateAndSaveTotalDistance(attendanceData, formattedDate);
        } else {
          toast.info("No attendance data available for today.");
        }
      } catch (error) {
        toast.error("Failed to save today's total distance.");
      }
    };

    if (user && !isDistanceSaved.current) {
      isDistanceSaved.current = true; // Mark it as called
      saveTodayDistance();
    }
  }, [user, fetchAttendanceByDate]);

  const calculateTotalDistance = (attendanceData) => {
    const totalMeters = attendanceData.reduce((total, attendance) => {
      let distance = attendance.distanceFromPrevious || "0 m";

      if (distance.includes("km")) {
        distance = parseFloat(distance) * 1000;
      } else if (distance.includes("m")) {
        distance = parseFloat(distance);
      }

      return total + distance;
    }, 0);

    const totalKilometers = totalMeters / 1000; // Convert meters to kilometers
    return totalKilometers; // Numeric value in kilometers
  };

  const calculateAndSaveTotalDistance = async (attendanceData, date) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.token;

      if (!token) {
        toast.error("User not authenticated!");
        return;
      }

      const totalDistance = calculateTotalDistance(attendanceData);

      const response = await fetch(`${apiUrl}/api/attendance/save-total-distance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          totalDistance,
        }),
      });

      if (response.ok) {
        toast.success("Total distance saved successfully for today!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save total distance.");
      }
    } catch (error) {
      toast.error("Failed to save total distance.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="home mx-auto mt-10 bg-white rounded-lg">
      <div className="md:flex">
        <Sidebar />
        <div className="md:mx-5 mx-1 w-full">
          <div className="md:flex flex-wrap">
            <div className="md:w-1/2 w-full mb-5">
              <Jumbotron />
              <LineChart />
            </div>
            <div className="md:w-1/2 w-full">
              <div className="mb-3 md:mb-[50px]">
                <HorizentalGraph
                  startDate="2024-11-01"
                  endDate="2024-11-30"
                  holidayArray={[
                    "2024-11-03",
                    "2024-11-10",
                    "2024-11-15",
                    "2024-11-17",
                    "2024-11-24",
                  ]}
                />
              </div>
              <div>
                <CalendarView />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

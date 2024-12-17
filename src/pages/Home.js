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
    // Refresh the page every 60 seconds
    const interval = setInterval(() => {
      window.location.reload();  // This will reload the page
    }, 60000);  // 60,000 milliseconds = 1 minute

    return () => clearInterval(interval);  // Cleanup interval on component unmount
  }, []);

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
    let totalMeters = 0;
    const pointToPointDistances = [];
  
    attendanceData.forEach((entry, index) => {
      let distance = entry.distanceFromPrevious || "0 m";
      let numericDistance = 0;
  
      if (distance.includes("km")) {
        numericDistance = parseFloat(distance) * 1000; // Convert km to meters
      } else if (distance.includes("m")) {
        numericDistance = parseFloat(distance); // Already in meters
      }
  
      // Skip the first distance entry (it's always 0)
      if (index > 0) {
        totalMeters += numericDistance;
        
        // Use letters A, B, C, etc. for the point labels
        const fromLabel = String.fromCharCode(65 + index - 1);  // Converts index 0 to 'A', 1 to 'B', etc.
        const toLabel = String.fromCharCode(65 + index); // Converts index 1 to 'B', 2 to 'C', etc.
  
        pointToPointDistances.push({
          from: fromLabel,
          to: toLabel,
          distance: numericDistance / 1000, // Store in km
        });
      }
    });
  
    const totalKilometers = totalMeters / 1000; // Convert total to km
  
    return { totalKilometers, pointToPointDistances };
  };
  
  

  const calculateAndSaveTotalDistance = async (attendanceData, date) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.token;
  
      if (!token) {
        toast.error("User not authenticated!");
        return;
      }
  
      // Calculate total distance and point-to-point distances
      const { totalKilometers, pointToPointDistances } = calculateTotalDistance(attendanceData);
      
      // Log the point-to-point distances
      console.log("Point-to-point distances:", pointToPointDistances);
  
      const response = await fetch(`${apiUrl}/api/attendance/save-total-distance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          totalDistance: totalKilometers,
          pointToPointDistances,  // Ensure pointToPointDistances is passed here
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
                  startDate="2024-12-01"
                  endDate="2024-12-31"
                  holidayArray={[
                    "2024-12-01",
                    "2024-12-08",
                    "2024-12-15",
                    "2024-12-22",
                    "2024-12-25",
                    "2024-12-29",
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

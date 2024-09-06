import React, { useEffect, useState } from "react";
import { FaHeart, FaCalendarTimes, FaCheckCircle } from "react-icons/fa";
import { ImBriefcase } from "react-icons/im";
import HorizentalGraphItem from "./HorizentalGraphItem";

const HorizentalGraph = ({ startDate, endDate, holidayArray }) => {
  const [summary, setSummary] = useState({ holidays: 0, present: 0, absent: 0, workDays: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user')).token;
        const holidays = holidayArray.join(',');

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/attendance/summary?startDate=${startDate}&endDate=${endDate}&holidays=${holidays}`, 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error("Error fetching attendance summary:", err.message);
      }
    };

    fetchSummary();
  }, [startDate, endDate, holidayArray]);

  return (
    <>
      <div className="text-gray-400 font-normal mb-5 mx-2 text-center">This month summary</div>
      <div className="flex mb-3 md:mb-[25px]">
        <HorizentalGraphItem
          title="Week off & Holidays"
          value={summary.holidays}
          color="bg-green-500"
          textColor="text-green-500"
          iconColor="bg-green-200"
          icon={<FaHeart />}
          width="100"
        />
        <HorizentalGraphItem
          title="Present"
          value={summary.present}
          color="bg-gray-800"
          textColor="text-gray-800"
          iconColor="bg-blue-200"
          icon={<FaCheckCircle />}
          width="100"
        />
      </div>
      <div className="flex">
        <HorizentalGraphItem
          title="Work Days"
          value={summary.workDays}
          color="bg-gray-400"
          textColor="text-gray-800"
          iconColor="bg-gray-200"
          width="100"
          icon={<ImBriefcase />}
        />
        <HorizentalGraphItem
          title="Absent"
          value={summary.absent}
          color="bg-indigo-500"
          textColor="text-black-500"
          iconColor="bg-red-400"
          icon={<FaCalendarTimes />}
          width="100"
        />
      </div>
    </>
  );
};

export default HorizentalGraph;

import React, { useEffect, useState, useRef } from "react";
import { FaChartLine } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';
import { useAttendance } from '../hooks/useAttendance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: false,
      text: "",
    },
    tooltip: {
      callbacks: {
        label: function(tooltipItem) {
          const hours = Math.floor(tooltipItem.parsed.y);
          const minutes = Math.round((tooltipItem.parsed.y - hours) * 60);
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHour = hours % 12 || 12; // Convert to 12-hour format
          const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
          return `${displayHour}:${displayMinutes} ${period}`;
        },
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        tooltipFormat: 'PP',
      },
      title: {
        display: true,
        text: 'Date',
      },
      ticks: {
        autoSkip: true,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      min: 8,
      max: 20, // 8 PM in 24-hour format
      title: {
        display: true,
        text: 'Check-in Time',
      },
      ticks: {
        stepSize: 1,
        callback: function(value) {
          const hours = value % 24;
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHour = hours % 12 || 12; // Convert to 12-hour format
          return `${displayHour} ${period}`;
        }
      }
    },
  },
  elements: {
    point: {
      radius: 5,
    },
  },
};

const LineChart = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const { fetchAllAttendance } = useAttendance();
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllAttendance();
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      // Filter data for the last seven days
      const filteredData = data
        .filter(attendance => new Date(attendance.date) >= sevenDaysAgo)
        .map(attendance => ({
          x: new Date(attendance.date), // x is a Date object for the x-axis
          y: new Date(attendance.timestamp).getHours() + new Date(attendance.timestamp).getMinutes() / 60, // y is the hour in decimal format for the y-axis
        }));

      setAttendanceData(filteredData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const data = {
    datasets: [
      {
        label: "Check-in Time",
        data: attendanceData,
        borderWidth: 3,
        borderColor: "#6366f1",
        fill: "start",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="w-full mt-20">
      <div className="flex items-center mb-4">
        <FaChartLine className="mr-2 text-blue-500" />
        <span className="text-gray-400 font-normal">Check-in Time</span>
      </div>
      <div className="w-full h-[400px]">
        <Line ref={chartRef} options={options} data={data} />
      </div>
    </div>
  );
};

export default LineChart;

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
  maintainAspectRatio: false, // Added to maintain the aspect ratio properly
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: false,
      text: "",
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
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      type: 'time',
      time: {
        unit: 'hour',
        parser: 'HH:mm',
        displayFormats: {
          hour: 'ha',
        },
      },
      min: '08:00',
      max: '18:00', // Adjust the max value based on your requirement
      title: {
        display: true,
        text: 'Time',
      },
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
      setAttendanceData(data.map(attendance => ({
        x: new Date(attendance.date), // Ensure x is a Date object
        y: new Date(attendance.timestamp), // Ensure y is a Date object for time scale
      })));
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once

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
        label: "Checkin Time",
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
        <span className="text-gray-400 font-normal">Checkin Time</span>
      </div>
      <div className="w-full h-[400px]"> {/* Set a fixed height to ensure it resizes properly */}
        <Line ref={chartRef} options={options} data={data} />
      </div>
    </div>
  );
};

export default LineChart;

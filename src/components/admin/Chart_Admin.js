import React from "react";
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

export const options = {
  responsive: true,
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
        unit: 'month',
        tooltipFormat: 'MMMM yyyy',
      },
      title: {
        display: true,
        text: 'Month',
      },
    },
    y: {
      beginAtZero: true,
      max: 50,
      title: {
        display: true,
        text: 'Count',
      },
    },
  },
  elements: {
    point: {
      radius: 3,
    },
  },
};

// Function to generate data for the past year
const generateData = () => {
  const data = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    data.unshift({
      x: date,
      y: Math.floor(Math.random() * 50) + 1,
    });
  }
  return data;
};

const data = {
  datasets: [
    {
      label: "Monthly Count",
      data: generateData(),
      borderWidth: 3,
      borderColor: "#6366f1",
      fill: "start",
      tension: 0.3,
    },
  ],
};

const AdminLineChart = () => {
  return (
    <div >
      <div className="flex items-center mb-4">
        <FaChartLine className="mr-2 text-blue-500" />
        <span className="text-gray-400 font-normal">Monthly Count</span>
      </div>
      <div className="w-full">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default AdminLineChart;
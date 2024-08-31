 
import React from "react";
import { FaHeart, FaHome, FaCamera, FaChartBar } from "react-icons/fa";
import HorizentalGraphItem from "../HorizentalGraphItem";

const HorizentalGraph = () => {
  return (
    <>
      <div className="text-gray-400 font-normal mb-5 mx-2">Details</div>
      <div className="flex mb-3 md:mb-[25px]">
        <HorizentalGraphItem
          title="Holidays"
          value="16"
          color="bg-green-500"
          textColor="text-green-500"
          iconColor="bg-green-200"
          icon={<FaHeart />}
          width="55"
        />
        <HorizentalGraphItem
          title="Present"
          value="160"
          color="bg-gray-800"
          textColor="text-gray-800"
          iconColor="bg-gray-400"
          icon={<FaHome />}
          width="50"
        />
      </div>
      <div className="flex">
        <HorizentalGraphItem
          title="Total Working Days"
          value="260"
          color="bg-gray-400"
          textColor="text-gray-400"
          iconColor="bg-gray-200"
          width="45"
          icon={<FaCamera />}
        />
        <HorizentalGraphItem
          title="Absent"
          value="4"
          color="bg-indigo-500"
          textColor="text-black-500"
          iconColor="bg-blue-200"
          icon={<FaChartBar />}
          width="70"
        />
      </div>
    </>
  );
};

export default HorizentalGraph;

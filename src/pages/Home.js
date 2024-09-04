import React from "react";
import LineChart from "../components/Chart";
import HorizentalGraph from "../components/HorizentalGraph";
import Jumbotron from "../components/Jumbotron";
import Sidebar from "../components/SideBar";
import VerticalGraph from "../components/CalendarView";
import { useAuthContext } from "../hooks/useAuthContext";

const Home = () => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="home mx-auto mt-10  bg-white  rounded-lg">
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
                <HorizentalGraph startDate="2024-08-01"
                  endDate="2024-08-30"
                  holidayArray={["2024-09-04", "2024-09-11", "2024-09-18", "2024-09-25"]} />
              </div>
              <div>
                <VerticalGraph />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

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
                <HorizentalGraph startDate="2024-11-01" //enter the startdate of every month beginning
                  endDate="2024-11-30" //enter the enddate of every month beginning
                  //enter the list of dates of holiday at beginning of every month
                  holidayArray={["2024-11-03", "2024-11-10", "2024-11-15", "2024-11-17", "2024-11-24"]} />
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

import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

const apiUrl = process.env.REACT_APP_API_URL || '';

const Jumbotron = () => {
  const [showPopup, setShowPopup] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [worktrackData, setWorktrackData] = useState([]);

  const [userDetails, setUserDetails] = useState(null);

  const { user } = useAuthContext();

  const fetchUserDetails = async (email) => {
    try {
      const response = await fetch(`${apiUrl}/api/user/user-details?email=${email}`);
      const data = await response.json();

      if (response.ok) {
        setUserDetails(data);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.log(email);
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (showPopup) {
      fetchUserDetails(user.email);
    }
  }, [showPopup, user.email]);

  const openPopup = () => {
    setShowPopup(true);
    fetchWorktrackData(); // Fetch data when the popup opens
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const fetchWorktrackData = async () => {
    try {
      // Fetch worktrack data from your API with the selected date as a query parameter
      const response = await fetch(`/api/worktrack?date=${selectedDate}`);
      const data = await response.json();
      setWorktrackData(data);
    } catch (error) {
      console.error("Error fetching worktrack data:", error);
    }
  };

  useEffect(() => {
    if (showPopup) {
      fetchWorktrackData();
    }
  }, [selectedDate, showPopup]); // Re-fetch data when the date or popup state changes

  return (
    <div className="flex bg-gray-100 items-center justify-between text-black-500 w-full md:p-[30px] p-2 rounded-lg relative">
      <div className="w-9/12 md:text-base text-sm">
        Welcome {user.email}, You can see your Site Visit Details here!!!
      </div>
      <div className="mx-2">
        <button
          className="bg-indigo-500 text-white rounded-md p-2 text-center w-[120px]"
          onClick={openPopup}
        >
          Open
        </button>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-gray-400 bg-opacity-75 blur-lg"></div>
          <div className="bg-white rounded-lg p-8 max-w-lg w-full z-10">
            <div className="flex justify-end">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closePopup}
              >
                &times;
              </button>
            </div>
            <div className="mt-4">

            {userDetails ? (
                <>
                  <h2 className="text-lg font-bold">{userDetails.fullName}</h2>            
                  <p className="text-sm text-gray-800">Email: {userDetails.email}</p>
                  <p className="text-sm text-gray-800">Phone: {userDetails.phoneNumber}</p>
                  <p className="text-sm text-gray-800">Reporting Manager: {userDetails.reportingManager}</p>
                  <p className="text-sm text-gray-800">State: {userDetails.state}</p>
                </>
              ) : (
                <p>Loading...</p>
              )}
              <div className="mt-4">
                <h3 className="text-lg font-bold">Worktrack Data</h3>
                <input
                  type="date"
                  value={selectedDate}
                  className="border border-gray-300 rounded-md p-2 mt-2 w-full"
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <table className="min-w-full mt-4 border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      
                      <th className="border border-gray-300 px-4 py-2">Total Site Visited</th>
                      <th className="border border-gray-300 px-4 py-2">Distance Travelled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worktrackData.length > 0 ? (
                      worktrackData.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.site}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.distance}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center p-4 text-gray-500">
                          No data available for the selected date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jumbotron;

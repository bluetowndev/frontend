import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

const apiUrl = process.env.REACT_APP_API_URL || '';

const Jumbotron = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const { user } = useAuthContext();

  const fetchUserDetails = async (email) => {
    try {
      const response = await fetch(`${apiUrl}/api/user/user-details?email=${email}`);
      const data = await response.json();
      {console.log(data)}
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
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="flex bg-gray-100 items-center justify-between text-black-500 w-full md:p-[30px] p-2 rounded-lg relative">
      <div className="w-9/12 md:text-base text-sm">
        Welcome {user.email}, You can see your profile here!!!
      </div>
      <div className="mx-2">
        <button
          className="bg-indigo-500 text-white rounded-md p-2 text-center w-[120px]"
          onClick={openPopup}
        >
          Click me
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jumbotron;

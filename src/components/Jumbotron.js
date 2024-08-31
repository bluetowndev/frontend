import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

const Jumbotron = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useAuthContext();

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
              <h2 className="text-lg font-bold">{user.fullName}</h2>            
              <p className="text-sm text-gray-800">Email: {user.email}</p>
              <p className="text-sm text-gray-800">Phone: {user.phoneNumber}</p>
              <p className="text-sm text-gray-800">Reporting Manager: {user.reportingManager}</p>
              <p className="text-sm text-gray-800">State: {user.state}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jumbotron;
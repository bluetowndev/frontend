import React, { useState } from "react";
import { FaHome, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const AdminSidebar = () => {
  const [activeLink, setActiveLink] = useState("home");

  const handleSetActive = (link) => {
    setActiveLink(link);
  };

  return (
    <div className="flex">
      <div className="bg-white md:w-[90px] w-full p-3 mb-2 md:flex md:items-center md:justify-center">
        <div className="rounded-xl p-4 bg-indigo-950 md:space-y-8 space-y-4">
          <ul className="flex md:flex-col justify-around md:justify-start w-full md:w-auto">
            <li className="mx-2 mb-4 md:mb-8">
              <Link
                to="/admin-dashboard"
                onClick={() => handleSetActive("home")}
                className={`p-2 text-white text-4xl ${
                  activeLink === "home" ? "text-white rounded-lg" : ""
                }`}
              >
                <FaHome />
              </Link>
            </li>
            <li className="mx-2 mb-4 md:mb-0">
              <Link
                to="/signup"
                onClick={() => handleSetActive("signup")}
                className={`p-2 text-white text-4xl ${
                  activeLink === "registration" ? "text-white rounded-lg" : ""
                }`}
              >
                <FaUserPlus />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

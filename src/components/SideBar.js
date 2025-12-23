// src/components/Sidebar.jsx
import React, { useState } from "react";
import { FaHome, FaCameraRetro } from "react-icons/fa";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import Camera from "./Camera";

Modal.setAppElement('#root');

const Sidebar = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleSetActive = (link) => {
    setActiveLink(link);
    if (link === "attendance") {
      setModalIsOpen(true);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setActiveLink("home");
  };

  return (
    <div className="flex">
      {!modalIsOpen && (
        <div className="w-full flex items-center justify-center">
          <div className="rounded-2xl bg-gradient-to-b from-indigo-600 to-purple-600 p-4">
            <ul className="flex md:flex-col justify-center items-center gap-8">
              <li>
                <Link
                  to="/"
                  onClick={() => handleSetActive("home")}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    activeLink === "home"
                      ? "bg-white text-indigo-600"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <FaHome className="text-2xl" />
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleSetActive("attendance")}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    activeLink === "attendance"
                      ? "bg-white text-indigo-600"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <FaCameraRetro className="text-2xl" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Camera Modal"
        className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-6 mx-auto my-20 w-full max-w-md"
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
      >
        <Camera onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default Sidebar;

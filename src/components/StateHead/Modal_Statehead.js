import React from "react";

const Modal = ({ showModal, setShowModal, title, desc, additionalDetails }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 mb-4">{desc}</p>
        <p className="text-gray-700 mb-4">{additionalDetails}</p>
        <button
          className="bg-indigo-500 text-white rounded-md p-2"
          onClick={() => setShowModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
import React from "react";

const Modal = ({ showModal, setShowModal, title, desc, additionalDetails }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-gray-700 mb-4">{desc}</div>
        {additionalDetails && <div className="text-gray-700 mb-4">{additionalDetails}</div>}
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

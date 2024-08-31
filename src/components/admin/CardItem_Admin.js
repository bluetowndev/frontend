import React, { useState } from "react";
import { AiOutlineUser } from "react-icons/ai"; // Import the user icon
import Modal from "./Modal_Admin";

const CardItem = (props) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-gray-300 rounded-3xl p-5 mx-2 md:w-6/12">
      <div className="flex items-center justify-between">
        <div className="mx-3 bg-gray-500 p-4 rounded-lg">
          <AiOutlineUser className="text-white" size={24} /> {/* Use the user icon */}
        </div>
        <div className="mx-3">
          <div className="font-bold md:text-xl text-md">{props.title}</div>
          <div className="text-sm font-light text-gray-800 mb-2">
            {props.desc}
          </div>
          <div>
            <button
              className="bg-indigo-500 text-white rounded-md p-2 text-center w-[120px]"
              onClick={() => setShowModal(true)}
            >
              Button
            </button>
          </div>
        </div>
      </div>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        title={props.title}
        desc={props.desc}
        additionalDetails={props.additionalDetails}
      />
    </div>
  );
};

export default CardItem;
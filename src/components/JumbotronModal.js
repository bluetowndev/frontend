import React from "react";

const JumbotronModal = ({ showModal, setShowModal, employeeDetails }) => {
  // Function to handle closing the modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {showModal ? (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <div>
              {/* Display employee details */}
              <h2>{employeeDetails.name}</h2>
              <p>Email: {employeeDetails.email}</p>
              <p>Department: {employeeDetails.department}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default JumbotronModal;
import React from "react";
import CardItem from "./CardItem_Admin";

const AdminCards = () => {
  const cardData = [
    { title: "Active Employee", desc: "Full Time", additionalDetails: "Detailed information about active employees." },
    { title: "Interns", desc: "On Internship", additionalDetails: "Detailed information about interns." },
  ];

  return (
    <div className="p-2 space-y-4 md:flex md:items-center md:justify-center md:space-y-0">
      {cardData.map((data, index) => (
        <CardItem
          key={index}
          title={data.title}
          desc={data.desc}
          additionalDetails={data.additionalDetails}
        />
      ))}
    </div>
  );
};

export default AdminCards;
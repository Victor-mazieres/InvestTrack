import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./themed-calendar.css"; // Fichier de styles personnalisé

const ThemedDatePicker = ({ selected, onChange, placeholderText }) => {
  return (
    <div className="w-full">
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        className="w-full p-3 border rounded-3xl bg-gray-50"
        style={{ width: "100%" }} // Assurez-vous que le champ occupe toute la largeur
        calendarClassName="themed-calendar" // Classe personnalisée pour le calendrier
        popperPlacement="bottom"
        showYearDropdown
        showMonthDropdown
      />
    </div>
  );
};

export default ThemedDatePicker;
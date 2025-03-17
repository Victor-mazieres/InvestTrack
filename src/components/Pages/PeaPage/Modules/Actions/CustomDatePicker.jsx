import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./themed-calendar.css"; // Import du fichier de styles personnalisé

const ThemedDatePicker = ({ selected, onChange, placeholderText }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      placeholderText={placeholderText}
      className="w-full p-3 border rounded-3xl bg-gray-50"
      calendarClassName="themed-calendar"  // La classe personnalisée
      popperPlacement="bottom"
      showYearDropdown
      showMonthDropdown
    />
  );
};

export default ThemedDatePicker;

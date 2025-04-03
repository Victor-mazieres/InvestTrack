import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { X } from "lucide-react"; // Import de l'icône de croix

export default function ThemedDatePicker({ selectedDate, onChange, onClose }) {
  const calendarStyles = `
    .react-calendar {
      background-color: #1e1e1e;
      border-radius: 1rem;
      border: none;
      padding: 1rem;
      color: #d1d5db;
      width: 100%;
      max-width: 365px;
    }
    .react-calendar__navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: transparent;
      margin-bottom: 0.5rem;
      padding: 0;
    }
    .react-calendar__navigation button {
      background: none;
      border: none;
      color: #d1d5db;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s ease;
    }
    .react-calendar__navigation button:hover {
      background-color: #374151;
    }
    .react-calendar__navigation span {
      font-size: 1.1rem;
      font-weight: 600;
      color: #d1d5db;
    }
    .react-calendar__month-view__weekdays {
      text-transform: uppercase;
      font-size: 0.75rem;
      color: #9ca3af;
      margin-bottom: 0.5rem;
    }
    .react-calendar__tile {
      background: none;
      border: none;
      color: #d1d5db;
      border-radius: 0.5rem;
      padding: 0.4rem 0;
      position: relative;
      transition: background-color 0.2s ease;
    }
    .react-calendar__tile:enabled:hover {
      background-color: #2d2d2d;
    }
    .react-calendar__tile--now {
      background-color: #3b82f6;
      font-weight: bold;
    }
    .react-calendar__tile--active {
      background-color: #22b99a !important;
      color: #ffffff !important;
    }
    .react-calendar__month-view__days__day--neighboringMonth {
      color: #6b7280;
    }
    .react-calendar__month-view__days {
      gap: 0.25rem;
    }
  `;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        // Ferme le calendrier si l'on clique en dehors
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <style>{calendarStyles}</style>
      <div className="relative bg-gray-800 rounded-3xl shadow-lg p-4 z-10">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <Calendar
          onChange={(date) => {
            onChange(date);
            onClose();
          }}
          value={selectedDate}
        />
      </div>
    </div>
  );
}

// src/components/Pages/Dashboard/Modules/DividendCalendar.jsx
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function DividendCalendar({ dividends }) {
  // Insertion des styles sombres directement via une balise <style>
  const darkCalendarStyles = `
    .react-calendar {
      background-color: #1f2b36;
      border-radius: 1rem;
      border: none;
      padding: 1rem;
      color: #ffffff;
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
      color: #ffffff;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s ease;
    }
    .react-calendar__navigation button:hover {
      background-color: #2a3946;
    }
    .react-calendar__navigation span {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .react-calendar__month-view__weekdays {
      text-transform: uppercase;
      font-size: 0.75rem;
      color: #a9b3bd;
      margin-bottom: 0.5rem;
    }
    .react-calendar__tile {
      background: none;
      border: none;
      color: #ffffff;
      border-radius: 0.5rem;
      padding: 0.4rem 0;
      transition: background-color 0.2s ease;
    }
    .react-calendar__tile:enabled:hover {
      background-color: #2a3946;
    }
    .react-calendar__tile--now {
      background-color: #293a49;
      font-weight: bold;
    }
    .react-calendar__tile--now:enabled:hover {
      background-color: #314456;
    }
    .react-calendar__tile--active {
      background-color: #506d82 !important;
      color: #ffffff !important;
    }
    .react-calendar__month-view__days__day--neighboringMonth {
      color: #6c7986;
    }
    .react-calendar__month-view__days {
      gap: 0.25rem;
    }
  `;

  // Fonction utilitaire pour formater une date en "YYYY-MM-DD"
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // tileContent affiche le montant total des dividendes pour le jour
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const tileDateStr = formatLocalDate(date);
      // Convertir event.date en objet Date s'il ne l'est pas déjà
      const events = dividends.filter(
        (event) => formatLocalDate(new Date(event.date)) === tileDateStr
      );
      if (events.length > 0) {
        const total = events.reduce((sum, ev) => sum + ev.amount, 0);
        return (
          <div className="mt-1 text-xs font-semibold text-green-400">
            {total}€
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Injection des styles sombres */}
      <style>{darkCalendarStyles}</style>
      {/* Calendrier avec tileContent et largeur limitée à max-w-lg */}
      <Calendar tileContent={tileContent} className="w-full max-w-lg" />
      {/* Liste détaillée des dividendes */}
      <div className="mt-6 w-full max-w-lg">
        <h3 className="text-md font-semibold text-white mb-2">
          Dividendes enregistrés :
        </h3>
        <ul className="max-h-40 overflow-y-auto space-y-1 border border-gray-700 p-2 rounded">
          {dividends.map((event, index) => {
            const eventDate = new Date(event.date);
            return (
              <li
                key={index}
                className="text-sm text-gray-300 border-b border-gray-700 last:border-none pb-1"
              >
                {eventDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                - {event.amount}€
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// src/components/Pages/Dashboard/Modules/DividendCalendar.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function DividendCalendar({ dividends }) {
  // Styles personnalisés pour un design light (fond blanc, scaling, centrage)
  const lightCalendarStyles = `
    .react-calendar {
      background-color: #ffffff;
      border-radius: 1rem;
      border: none;
      padding: 1rem;
      color: #374151; /* text-primary */
      transform: scale(1.2);
      transform-origin: center center;
      margin: 0 auto;
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
      color: #374151;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s ease;
    }
    .react-calendar__navigation button:hover {
      background-color: #86efac;
    }
    .react-calendar__navigation span {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
    }
    .react-calendar__month-view__weekdays {
      text-transform: uppercase;
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    .react-calendar__tile {
      background: none;
      border: none;
      color: #374151;
      border-radius: 0.5rem;
      padding: 0.4rem 0;
      position: relative;
      transition: background-color 0.2s ease;
    }
    .react-calendar__tile:enabled:hover {
      background-color: #f3f4f6;
    }
    .react-calendar__tile--now {
      background-color: #e0f2fe;
      font-weight: bold;
    }
    .react-calendar__tile--active {
      background-color: #86efac !important;
      color: #ffffff !important;
    }
    .react-calendar__month-view__days__day--neighboringMonth {
      color: #9ca3af;
    }
    .react-calendar__month-view__days {
      gap: 0.25rem;
    }
  `;

  // Formater une date en "YYYY-MM-DD" pour la comparaison
  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Formater la date pour l'affichage en "DD/MM/YYYY"
  const formatDisplayDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [selectedDate, setSelectedDate] = useState(null);

  // Normaliser la date actuelle (sans l'heure)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filtrer les dividendes dont la date est aujourd'hui ou ultérieure
  const upcomingDividends = dividends.filter(
    (event) => new Date(event.date) >= today
  );
  const sorted = upcomingDividends.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const earliestDate = sorted.length > 0 ? sorted[0].date : null;
  // Utiliser formatLocalDate pour comparer les dates
  const earliestDateEvents = earliestDate
    ? sorted.filter((ev) => formatLocalDate(ev.date) === formatLocalDate(earliestDate))
    : [];

  // Afficher un point vert sur les dates comportant un dividende
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const tileDateStr = formatLocalDate(date);
      const eventsForDate = dividends.filter(
        (event) => formatLocalDate(event.date) === tileDateStr
      );
      if (eventsForDate.length > 0) {
        return (
          <div className="absolute bottom-1 right-1">
            <div className="w-2 h-2 bg-greenLight rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  // Dividendes correspondant à la date sélectionnée
  const filteredEvents = selectedDate
    ? dividends.filter(
        (event) =>
          formatLocalDate(event.date) === formatLocalDate(selectedDate)
      )
    : [];

  // Clic sur une date : si la même date est cliquée, la désélectionner
  const handleClickDay = (date) => {
    if (selectedDate && formatLocalDate(date) === formatLocalDate(selectedDate)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Injection des styles */}
      <style>{lightCalendarStyles}</style>

      {/* Calendrier agrandi */}
      <Calendar
        onClickDay={handleClickDay}
        tileContent={tileContent}
        className="w-full max-w-lg relative"
      />

      <div className="mt-12 w-full max-w-lg">
        {selectedDate ? (
          <h3 className="text-md font-semibold text-primary mb-2">
            Dividendes enregistrés pour{" "}
            <span className="text-greenLight">
              {formatDisplayDate(selectedDate)}
            </span>
          </h3>
        ) : earliestDate ? (
          <>
            <h3 className="text-md font-semibold text-primary mb-2">
              Prochain dividende :{" "}
              <span className="text-greenLight">
                {formatDisplayDate(earliestDate)}
              </span>
            </h3>
            <ul className="mb-4 space-y-1">
              {earliestDateEvents.map((ev, idx) => (
                <li key={idx} className="text-primary">
                  <span className="uppercase font-bold">{ev.name}</span> -{" "}
                  <span className="text-greenLight font-bold text-md">
                    {ev.amount}€
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h3 className="text-md font-semibold text-primary mb-2">
            Aucun dividende à venir.
          </h3>
        )}

        {selectedDate &&
          (filteredEvents.length > 0 ? (
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {filteredEvents.map((event, index) => (
                <li key={index} className="text-lg font-bold text-primary pb-1">
                  <span className="uppercase">{event.name}</span> -{" "}
                  <span className="text-greenLight">{event.amount}€</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-primary">
              Aucun dividende enregistré pour cette date.
            </p>
          ))}
      </div>
    </div>
  );
}

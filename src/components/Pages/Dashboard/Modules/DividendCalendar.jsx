import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function DividendCalendar({ dividends }) {
  const darkCalendarStyles = `
    .react-calendar {
      background-color: #1e1e1e;
      border-radius: 1rem;
      border: none;
      padding: 1rem;
      color: #d1d5db;
      margin: 0 auto;
      max-width: 100%;
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
      color: #fff;
    }
    .react-calendar__tile--active {
      background-color: #2e8e97 !important;
      color: #fff !important;
    }
    .react-calendar__month-view__days__day--neighboringMonth {
      color: #6b7280;
    }
    .react-calendar__month-view__days {
      gap: 0.25rem;
    }
  `;

  // Formate une date pour la comparaison (YYYY-MM-DD)
  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Formate une date pour l'affichage (DD/MM/YYYY)
  const formatDisplayDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [selectedDate, setSelectedDate] = useState(null);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filtrer les dividendes à venir (>= aujourd'hui)
  const upcomingDividends = dividends.filter(
    (event) => new Date(event.date) >= today
  );
  const sorted = upcomingDividends.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const earliestDate = sorted.length > 0 ? sorted[0].date : null;
  const earliestDateEvents = earliestDate
    ? sorted.filter(
        (ev) => formatLocalDate(ev.date) === formatLocalDate(earliestDate)
      )
    : [];

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

  const filteredEvents = selectedDate
    ? dividends.filter(
        (event) =>
          formatLocalDate(event.date) === formatLocalDate(selectedDate)
      )
    : [];

  const handleClickDay = (date) => {
    if (selectedDate && formatLocalDate(date) === formatLocalDate(selectedDate)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <style>{darkCalendarStyles}</style>
      <Calendar
        onClickDay={handleClickDay}
        tileContent={tileContent}
        className="w-full max-w-lg relative"
      />
      <div className="mt-12 w-full max-w-lg">
        {selectedDate ? (
          <h3 className="text-md font-semibold text-gray-100 mb-2">
            Dividendes enregistrés pour{" "}
            <span className="text-greenLight">
              {formatDisplayDate(selectedDate)}
            </span>
          </h3>
        ) : earliestDate ? (
          <>
            <h3 className="text-md font-semibold text-gray-100 mb-2">
              Prochain dividende :{" "}
              <span className="text-greenLight">
                {formatDisplayDate(earliestDate)}
              </span>
            </h3>
            <ul className="mb-4 space-y-1">
              {earliestDateEvents.map((ev, idx) => (
                <li key={idx} className="text-md text-gray-100">
                  <span className="uppercase font-bold">{ev.name}</span> -{" "}
                  <span className="text-greenLight font-bold">
                    {ev.amount}€
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h3 className="text-md font-semibold text-gray-100 mb-2">
            Aucun dividende à venir.
          </h3>
        )}

        {selectedDate &&
          (filteredEvents.length > 0 ? (
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {filteredEvents.map((event, index) => (
                <li key={index} className="text-md font-bold text-gray-100 pb-1">
                  <span className="uppercase">{event.name}</span> -{" "}
                  <span className="text-greenLight">{event.amount}€</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-100">
              Aucun dividende enregistré pour cette date.
            </p>
          ))}
      </div>
    </div>
  );
}

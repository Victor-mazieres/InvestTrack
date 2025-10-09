// NextDividend.jsx
import React, { useContext, useEffect, useState } from "react";
import { ActionsContext } from "../../PeaPage/Modules/Reutilisable/ActionsContext";
import { format, differenceInCalendarDays } from "date-fns";

export default function NextDividend() {
  const { actions, loading } = useContext(ActionsContext);
  const [nextDividend, setNextDividend] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showRemaining, setShowRemaining] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);

  // Calcul du prochain dividende (sans redemander fetchActions)
  useEffect(() => {
    if (actions.length > 0) {
      const now = new Date();
      const upcomingDividends = actions
        .filter((action) => action.dividendDate)
        .map((action) => new Date(action.dividendDate))
        .filter((date) => date >= now);
      if (upcomingDividends.length > 0) {
        const nearest = upcomingDividends.reduce((prev, curr) =>
          curr < prev ? curr : prev
        );
        setNextDividend(nearest);
      } else {
        setNextDividend(null);
      }
    }
  }, [actions]);

  // Mise à jour de la barre de progression (cycle de 30 jours)
  useEffect(() => {
    if (!nextDividend) return;
    const dividendCycle = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes
    const cycleStart = new Date(nextDividend.getTime() - dividendCycle);
    const updateProgress = () => {
      const now = new Date();
      let p = (now - cycleStart) / dividendCycle;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      setProgress(p);
    };
    updateProgress();
    const interval = setInterval(updateProgress, 60000); // mise à jour chaque minute
    return () => clearInterval(interval);
  }, [nextDividend]);

  // Retour automatique à l'affichage initial après 3 secondes
  useEffect(() => {
    let timer;
    if (showRemaining) {
      timer = setTimeout(() => {
        setShowRemaining(false);
      }, 3000);
    }
    return () => timer && clearTimeout(timer);
  }, [showRemaining]);

  if (loading) return <p className="text-gray-100">Chargement...</p>;
  if (!nextDividend)
    return <p className="text-gray-100">Aucun dividende à venir</p>;

  const formattedDate = format(nextDividend, "dd/MM/yyyy");
  const daysLeft = differenceInCalendarDays(nextDividend, new Date());

  const handleToggle = () => {
    if (clickLoading) return;
    setClickLoading(true);
    setTimeout(() => {
      setClickLoading(false);
      setShowRemaining((prev) => !prev);
    }, 1000);
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer  border-gray-600 p-4 rounded-3xl shadow-2xl hover:shadow-3xl transition-transform duration-300 transform hover:scale-105"
      onClick={handleToggle}
    >
      <h3 className="text-md font-semibold text-gray-100 mb-5">
        Prochain dividende
      </h3>
      <div className="flex items-center justify-center h-10 w-full">
        {clickLoading ? (
          <div className="text-xl font-bold text-greenLight">Chargement...</div>
        ) : showRemaining ? (
          <div className="text-xl font-bold text-greenLight">
            Encore {daysLeft} jours
          </div>
        ) : (
          <div className="text-xl font-bold text-greenLight">
            {formattedDate}
          </div>
        )}
      </div>
      <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
        <div
          className="bg-greenLight h-2 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

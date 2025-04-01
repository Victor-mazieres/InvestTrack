import React, { useContext, useEffect, useState } from "react";
import { ActionsContext } from "../../PeaPage/Modules/Reutilisable/ActionsContext";
import { format, differenceInCalendarDays } from "date-fns";

export default function NextDividend() {
  const { actions, loading, fetchActions } = useContext(ActionsContext);
  const [nextDividend, setNextDividend] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showRemaining, setShowRemaining] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);

  // Lance le fetch si nécessaire
  useEffect(() => {
    if (actions.length === 0) {
      fetchActions();
    }
  }, [actions, fetchActions]);

  // Détermine la date de dividende la plus proche
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
    const dividendCycle = 30 * 24 * 60 * 60 * 1000; // 30 jours en ms
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
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showRemaining]);

  if (loading) return <p>Chargement...</p>;
  if (!nextDividend) return <p>Aucun dividende à venir</p>;

  const formattedDate = format(nextDividend, "dd/MM/yyyy");
  const daysLeft = differenceInCalendarDays(nextDividend, new Date());

  // Gestion du clic : affiche "Chargement..." puis bascule l'état
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
      className="flex flex-col items-center cursor-pointer"
      onClick={handleToggle}
    >
      <h3 className="text-md font-semibold text-primary mb-5">
        Prochain dividende
      </h3>
      {/* Conteneur avec hauteur fixe pour conserver la mise en page */}
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
      {/* Barre de progression */}
      <div className="w-full bg-gray-300 h-2 rounded-full mt-2">
        <div
          className="bg-greenLight h-2 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

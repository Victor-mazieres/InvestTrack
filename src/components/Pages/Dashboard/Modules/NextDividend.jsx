import React, { useContext, useEffect, useState } from "react";
import { ActionsContext } from "../../PeaPage/Modules/Actions/ActionsContext"; // Vérifiez le chemin
import { format } from "date-fns";

export default function NextDividend() {
  const { actions, loading, fetchActions } = useContext(ActionsContext);
  const [nextDividend, setNextDividend] = useState(null);

  // Si le tableau d'actions est vide, on lance le fetch
  useEffect(() => {
    if (actions.length === 0) {
      fetchActions();
    }
  }, [actions, fetchActions]);

  // Calculer la date de dividende la plus proche parmi toutes les actions
  useEffect(() => {
    if (actions.length > 0) {
      const now = new Date();
      // Filtrer les actions qui ont une date de dividende et dont la date est dans le futur ou aujourd'hui
      const upcomingDividends = actions
        .filter((action) => action.dividendDate)
        .map((action) => new Date(action.dividendDate))
        .filter((date) => date >= now);

      if (upcomingDividends.length > 0) {
        // Récupérer la date la plus proche (la plus petite)
        const nearest = upcomingDividends.reduce((prev, curr) =>
          curr < prev ? curr : prev
        );
        setNextDividend(nearest);
      } else {
        setNextDividend(null);
      }
    }
  }, [actions]);

  if (loading) return <p>Chargement...</p>;
  if (!nextDividend) return <p>Aucun dividende à venir</p>;

  return (
    <div>
      <h3 className="text-md font-semibold text-primary">
        Prochain dividende
      </h3>
      <p className="text-2xl font-bold text-greenLight">
        {format(nextDividend, "dd/MM/yyyy")}
      </p>
    </div>
  );
}

import React, { useContext, useEffect } from "react";
import { ActionsContext } from "../../PeaPage/Modules/Actions/ActionsContext";

export default function TotalActions() {
    const { actions, loading, fetchActions } = useContext(ActionsContext);
  
    // Relancer le fetch si le tableau d'actions est vide
    useEffect(() => {
      if (actions.length === 0) {
        fetchActions();
      }
    }, [actions, fetchActions]);
  
    if (loading) return <p>Chargement...</p>;
  
    // Somme des quantités de chaque action
    const totalShares = actions.reduce(
      (total, action) => total + (action.quantity || 0),
      0
    );
  
    return (
      <div >
        <h3 className="text-md font-semibold text-primary">Total d'actions</h3>
        <p className="text-xl font-bold text-greenLight">{totalShares}</p>
      </div>
    );
  }

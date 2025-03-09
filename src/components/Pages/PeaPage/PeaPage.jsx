import PeaGraph from "./Modules/PeaGraph";
import PeaPortfolio from "./Modules/PeaPortfolio";
import PeaTopActions from "./Modules/PeaTopActions";

export default function PeaPage() {
  return (
    <div className="p-4 bg-light min-h-screen pt-8 flex flex-col space-y-6" >
      <h1 className="text-2xl font-bold text-primary">Suivi du PEA</h1>

      {/* Graphique */}
      <PeaGraph />

      {/* Top 5 Actions */}
      <PeaTopActions />

      {/* Répartition du Portefeuille */}
      <PeaPortfolio />
    </div>
  );
}

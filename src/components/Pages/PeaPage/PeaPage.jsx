import PeaGraph from "./Modules/PeaGraph";
import PeaTopActions from "./Modules/PeaTopActions";
import PeaPortfolio from "./Modules/PeaPortfolio";

export default function PeaPage() {
  return (
    <div className="p-4 bg-light min-h-screen pt-16 flex flex-col space-y-6">
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

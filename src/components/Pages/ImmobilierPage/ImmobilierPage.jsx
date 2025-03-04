import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const dataImmo = [
  { name: "Loyers", value: 65 },
  { name: "Charges", value: 20 },
  { name: "Taxes", value: 15 },
];

const COLORS = ["#2e8e97", "#bdced3", "#d2dde1"];

export default function ImmobilierPage() {
  return (
    <div className="p-4 bg-light min-h-screen pt-16">
      <h1 className="text-2xl font-bold text-primary">Suivi Immobilier</h1>

      {/* Graphique en camembert */}
      <div className="w-full mt-6">
        <h2 className="text-lg font-semibold text-secondary">Répartition des revenus</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={dataImmo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {dataImmo.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Liste des biens */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-secondary">Vos Biens</h2>
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <p className="text-primary font-semibold">Appartement Paris 16e</p>
          <p className="text-grayBlue">Loyer : 1 200€ • Charges : 200€</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <p className="text-primary font-semibold">Maison Lyon</p>
          <p className="text-grayBlue">Loyer : 900€ • Charges : 150€</p>
        </div>
      </div>
    </div>
  );
}

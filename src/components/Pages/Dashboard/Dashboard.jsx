import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const dataPEA = [
  { name: "Jan", value: 1200 },
  { name: "Fév", value: 1600 },
  { name: "Mar", value: 900 },
  { name: "Avr", value: 1400 },
  { name: "Mai", value: 1800 },
];

const dataImmo = [
  { name: "Loyer", value: 65 },
  { name: "Charges", value: 20 },
  { name: "Taxes", value: 15 },
];

const COLORS = ["#2e8e97", "#bdced3", "#d2dde1"];

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center p-4 bg-light min-h-screen pt-16">
      <h1 className="text-2xl font-bold text-primary mb-4">Dashboard</h1>

      {/* Graphique des performances du PEA */}
      <div className="w-full mt-6">
        <h2 className="text-lg font-semibold text-secondary">Performance PEA</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataPEA}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="value" stroke="#2e8e97" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Camembert de l'immobilier */}
      <div className="w-full mt-6">
        <h2 className="text-lg font-semibold text-secondary">Répartition Immobilière</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={dataImmo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
              {dataImmo.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const dataPEA = [
  { date: "Jan", valeur: 1200 },
  { date: "Fév", valeur: 1600 },
  { date: "Mar", valeur: 900 },
  { date: "Avr", valeur: 1400 },
  { date: "Mai", valeur: 1800 },
  { date: "Mai", valeur: 1100 },
];

export default function PeaGraph() {
  return (
    <div className="w-full p-4">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={dataPEA}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="valeur" stroke="#2e8e97" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

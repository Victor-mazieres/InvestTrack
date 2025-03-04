import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const dataPortfolio = [
  { name: "Tesla", value: 35 },
  { name: "Apple", value: 25 },
  { name: "Amazon", value: 20 },
  { name: "Microsoft", value: 10 },
  { name: "Google", value: 10 },
];

const COLORS = ["#2e8e97", "#bdced3", "#d2dde1", "#ebf1f3", "#0b2237"];

export default function PeaPortfolio() {
  return (
    <div className="w-full p-4 shadow-md ">
      <h2 className="text-lg font-semibold text-primary p-2 bg-white rounded-2xl shadow-lg">Répartition du Portefeuille</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={dataPortfolio} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
            {dataPortfolio.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

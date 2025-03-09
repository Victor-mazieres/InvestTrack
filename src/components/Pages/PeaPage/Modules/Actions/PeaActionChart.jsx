import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function PeaActionChart({ data }) {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-lg font-semibold text-primary">Évolution du prix</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="price" stroke="#2e8e97" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

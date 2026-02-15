"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const data = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 8000 },
    { month: "Mar", revenue: 12000 },
  ];

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Revenue Analytics
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

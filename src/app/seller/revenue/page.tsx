"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", revenue: 2000 },
  { day: "Tue", revenue: 3500 },
  { day: "Wed", revenue: 1500 },
  { day: "Thu", revenue: 4000 },
  { day: "Fri", revenue: 3000 },
  { day: "Sat", revenue: 4500 },
  { day: "Sun", revenue: 5000 },
];

export default function SellerRevenue() {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 text-brand-pink">
        Revenue Analytics
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

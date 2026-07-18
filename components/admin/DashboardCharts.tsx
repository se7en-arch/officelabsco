'use client';

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

export interface MonthlyPoint {
  month: string;
  revenue: number;
  orders: number;
  isCurrent?: boolean;
}

export function RevenueChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#999' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#999' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v === 0 ? '0' : `€${v}`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(28,28,28,.04)' }}
          contentStyle={{
            fontSize: 12,
            border: '1px solid #E8E8E8',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,.1)',
            padding: '8px 14px',
          }}
          formatter={(v) => [`€${Number(v).toFixed(2)}`, 'Приход']}
          labelStyle={{ fontWeight: 700, color: '#1C1C1C', marginBottom: 2 }}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isCurrent ? '#1C1C1C' : '#D1D5DB'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OrdersAreaChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -40, bottom: 0 }}>
        <defs>
          <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1C1C1C" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#1C1C1C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" hide />
        <YAxis hide />
        <Tooltip
          contentStyle={{ fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 6, padding: '4px 10px' }}
          formatter={(v) => [v, 'Поръчки']}
        />
        <Area type="monotone" dataKey="orders" stroke="#1C1C1C" strokeWidth={1.5} fill="url(#ordGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

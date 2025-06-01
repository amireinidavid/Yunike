'use client';

import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { salesData, topSellingProducts, deviceBreakdown } from '../data/mockData';

const ChartSection = () => {
  // Chart colors
  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Simplify top products data for bar chart
  const simplifiedProductData = topSellingProducts.map(product => ({
    name: product.name.length > 15 
      ? product.name.substring(0, 12) + '...' 
      : product.name,
    revenue: product.revenue
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Sales Over Time Chart */}
      <div className="bg-card rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-medium mb-4">Sales Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--muted-foreground)' }} 
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--popover)', 
                  color: 'var(--popover-foreground)',
                  border: '1px solid var(--border)'
                }} 
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--primary)" 
                strokeWidth={2}
                activeDot={{ r: 8, fill: 'var(--primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products Chart */}
      <div className="bg-card rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-medium mb-4">Top Selling Products</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={simplifiedProductData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                type="number" 
                tick={{ fill: 'var(--muted-foreground)' }}
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--popover)', 
                  color: 'var(--popover-foreground)',
                  border: '1px solid var(--border)'
                }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {simplifiedProductData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts - Optional */}
      <div className="bg-card rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-medium mb-4">Device Breakdown</h2>
        <div className="flex justify-center h-80">
          <ResponsiveContainer width="80%" height="100%">
            <PieChart>
              <Pie
                data={deviceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {deviceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span style={{ color: 'var(--card-foreground)' }}>{value}</span>} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--popover)', 
                  color: 'var(--popover-foreground)',
                  border: '1px solid var(--border)'
                }}
                formatter={(value) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Here you could add a geographic heatmap for sales by location */}
      <div className="bg-card rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-medium mb-4">Sales by Region</h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">
            Geographic visualization would be implemented here using react-simple-maps
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartSection; 
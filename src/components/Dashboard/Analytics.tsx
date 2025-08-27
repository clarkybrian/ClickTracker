import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Globe, Smartphone, Calendar } from 'lucide-react';
import { Link } from '../../types';

interface AnalyticsProps {
  links: Link[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ links }) => {
  // Mock data for demo purposes
  const totalClicks = links.reduce((sum, link) => sum + link.totalClicks, 0);
  const activeLinks = links.filter(link => link.isActive).length;

  const clicksByCountry = [
    { name: 'United States', value: 45, color: '#3B82F6' },
    { name: 'United Kingdom', value: 23, color: '#8B5CF6' },
    { name: 'Germany', value: 18, color: '#10B981' },
    { name: 'France', value: 14, color: '#F59E0B' },
  ];

  const clicksByDevice = [
    { name: 'Mobile', clicks: 156 },
    { name: 'Desktop', clicks: 89 },
    { name: 'Tablet', clicks: 23 },
  ];

  const clicksByDate = [
    { date: 'Jan 1', clicks: 12 },
    { date: 'Jan 2', clicks: 19 },
    { date: 'Jan 3', clicks: 23 },
    { date: 'Jan 4', clicks: 31 },
    { date: 'Jan 5', clicks: 28 },
    { date: 'Jan 6', clicks: 35 },
    { date: 'Jan 7', clicks: 42 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Clicks</p>
                <p className="text-2xl font-bold text-blue-900">{totalClicks}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Active Links</p>
                <p className="text-2xl font-bold text-purple-900">{activeLinks}</p>
              </div>
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">CTR</p>
                <p className="text-2xl font-bold text-green-900">12.4%</p>
              </div>
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Avg Daily</p>
                <p className="text-2xl font-bold text-orange-900">28</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Clicks by Device</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clicksByDevice}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="#3B82F6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Clicks by Country</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clicksByCountry}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {clicksByCountry.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Clicks Over Time</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={clicksByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
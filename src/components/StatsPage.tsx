import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';
import { format, endOfWeek, eachWeekOfInterval, parseISO } from 'date-fns';
import type { CakeIncident } from '../App';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface StatsPageProps {
  incidents: CakeIncident[];
}

export const StatsPage: React.FC<StatsPageProps> = ({ incidents }) => {
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '1year'>('6months');

  // Calculate person stats for bar chart
  const personStats = useMemo(() => {
    const stats = incidents.reduce((acc, incident) => {
      const name = incident.person_name;
      if (!acc[name]) {
        acc[name] = { total: 0, owed: 0, delivered: 0 };
      }
      acc[name].total++;
      if (incident.cake_delivered) {
        acc[name].delivered++;
      } else {
        acc[name].owed++;
      }
      return acc;
    }, {} as Record<string, { total: number; owed: number; delivered: number }>);

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10
  }, [incidents]);

  // Calculate weekly delivery data for line chart
  const weeklyData = useMemo(() => {
    const now = new Date();
    const monthsBack = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    
    const weeks = eachWeekOfInterval({
      start: startDate,
      end: now
    }, { weekStartsOn: 1 }); // Start week on Monday

    const weeklyStats = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const weekIncidents = incidents.filter(incident => {
        const incidentDate = parseISO(incident.created_at);
        return incidentDate >= weekStart && incidentDate <= weekEnd;
      });

      const delivered = weekIncidents.filter(i => i.cake_delivered).length;
      const owed = weekIncidents.filter(i => !i.cake_delivered).length;
      const total = weekIncidents.length;

      return {
        week: format(weekStart, 'MMM dd'),
        delivered,
        owed,
        total,
        weekStart
      };
    });

    return weeklyStats;
  }, [incidents, timeRange]);

  // Bar chart configuration
  const barChartData = {
    labels: personStats.map(p => p.name),
    datasets: [
      {
        label: 'Cakes Delivered',
        data: personStats.map(p => p.delivered),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Cakes Owed',
        data: personStats.map(p => p.owed),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Cake Leaderboard - Total Incidents by Person',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
          stepSize: 1,
        },
      },
    },
  };

  // Line chart configuration
  const lineChartData = {
    labels: weeklyData.map(d => d.week),
    datasets: [
      {
        label: 'Cakes Delivered',
        data: weeklyData.map(d => d.delivered),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'New Incidents',
        data: weeklyData.map(d => d.total),
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Weekly Cake Activity - Last ${timeRange === '3months' ? '3 Months' : timeRange === '6months' ? '6 Months' : '1 Year'}`,
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
          stepSize: 1,
        },
      },
    },
  };

  // Calculate summary stats
  const totalIncidents = incidents.length;
  const totalDelivered = incidents.filter(i => i.cake_delivered).length;
  const totalOwed = incidents.filter(i => !i.cake_delivered).length;
  const topDebtor = personStats[0];
  const deliveryRate = totalIncidents > 0 ? Math.round((totalDelivered / totalIncidents) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <BarChart3 className="h-10 w-10 text-amber-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-800">Cake Statistics</h1>
        </div>
        <p className="text-lg text-gray-600">
          Deep dive into your office's cake incident data and trends
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{totalIncidents}</div>
          <div className="text-sm text-gray-600 mt-1">Total Incidents</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{totalDelivered}</div>
          <div className="text-sm text-gray-600 mt-1">Cakes Delivered</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{totalOwed}</div>
          <div className="text-sm text-gray-600 mt-1">Cakes Owed</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{deliveryRate}%</div>
          <div className="text-sm text-gray-600 mt-1">Delivery Rate</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-lg font-bold text-amber-600 truncate">
            {topDebtor ? topDebtor.name : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 mt-1">Top Debtor</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="h-96">
            {personStats.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No data available yet</p>
                  <p className="text-sm">Start reporting incidents to see the leaderboard!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Time Range
              </h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '3months' | '6months' | '1year')}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 outline-none"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last 1 Year</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            {weeklyData.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No data available yet</p>
                  <p className="text-sm">Start reporting incidents to see trends!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Leaderboard */}
      {personStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-amber-600" />
            Detailed Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Incidents</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Cakes Delivered</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Cakes Owed</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Delivery Rate</th>
                </tr>
              </thead>
              <tbody>
                {personStats.map((person, index) => {
                  const rate = person.total > 0 ? Math.round((person.delivered / person.total) * 100) : 0;
                  return (
                    <tr key={person.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-amber-600 text-amber-100' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{person.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-600">{person.total}</td>
                      <td className="py-3 px-4 text-center font-bold text-green-600">{person.delivered}</td>
                      <td className="py-3 px-4 text-center font-bold text-red-600">{person.owed}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rate >= 80 ? 'bg-green-100 text-green-800' :
                          rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
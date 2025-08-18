import React, { useState, useEffect } from 'react';
import { Cake, Plus, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Navigation } from './components/Navigation';
import { AddIncidentForm } from './components/AddIncidentForm';
import { IncidentCard } from './components/IncidentCard';
import { StatsCard } from './components/StatsCard';
import { StatsPage } from './components/StatsPage';
import { Routes, Route } from 'react-router-dom';

export interface CakeIncident {
  id: string;
  person_name: string;
  incident_date: string;
  notes?: string;
  cake_delivered: boolean;
  created_at: string;
}

function App() {
  const [incidents, setIncidents] = useState<CakeIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('cake_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIncident = async (personName: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('cake_incidents')
        .insert([{
          person_name: personName,
          incident_date: new Date().toISOString().split('T')[0],
          notes: notes || null,
          cake_delivered: false
        }])
        .select()
        .single();

      if (error) throw error;
      setIncidents([data, ...incidents]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding incident:', error);
    }
  };

  const toggleCakeDelivered = async (id: string, delivered: boolean) => {
    try {
      const { error } = await supabase
        .from('cake_incidents')
        .update({ cake_delivered: delivered })
        .eq('id', id);

      if (error) throw error;

      setIncidents(incidents.map(incident =>
        incident.id === id ? { ...incident, cake_delivered: delivered } : incident
      ));
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  const totalIncidents = incidents.length;
  const totalOwed = incidents.filter(i => !i.cake_delivered).length;
  const totalDelivered = incidents.filter(i => i.cake_delivered).length;

  const leaderboard = incidents.reduce((acc, incident) => {
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

  const leaderboardEntries = Object.entries(leaderboard)
    .sort(([, a], [, b]) => b.owed - a.owed)
    .slice(0, 5);

  const HomePage = () => (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Cake className="h-12 w-12 text-amber-600 mr-3" />
          <h1 className="text-5xl font-bold text-gray-800">Office Cake Tracker</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Keep track of who owes cake for forgetting to lock their computer! 🍰
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Incidents"
          value={totalIncidents}
          icon={<TrendingUp className="h-6 w-6" />}
          color="bg-blue-500"
        />
        <StatsCard
          title="Cakes Owed"
          value={totalOwed}
          icon={<Clock className="h-6 w-6" />}
          color="bg-red-500"
        />
        <StatsCard
          title="Cakes Delivered"
          value={totalDelivered}
          icon={<CheckCircle className="h-6 w-6" />}
          color="bg-green-500"
        />
        <StatsCard
          title="Active Debtors"
          value={leaderboardEntries.filter(([, stats]) => stats.owed > 0).length}
          icon={<Users className="h-6 w-6" />}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2">
          {/* Add New Incident Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
            >
              <Plus className="h-6 w-6" />
              Report New Incident
            </button>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-600" />
              Recent Incidents
            </h2>

            {incidents.length === 0 ? (
              <div className="text-center py-12">
                <Cake className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No incidents recorded yet!</p>
                <p className="text-gray-400">Click "Report New Incident" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.slice(0, 10).map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onToggleDelivered={toggleCakeDelivered}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Leaderboard */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-red-500" />
              Cake Debt Leaderboard
            </h2>

            {leaderboardEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data yet!</p>
            ) : (
              <div className="space-y-4">
                {leaderboardEntries.map(([name, stats], index) => (
                  <div
                    key={name}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-transform duration-200 hover:shadow-md hover:scale-105 ${
                      stats.owed > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-400 text-yellow-900'
                            : index === 1
                            ? 'bg-gray-400 text-gray-900'
                            : index === 2
                            ? 'bg-amber-600 text-amber-100'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{name}</p>
                        <p className="text-sm text-gray-600">
                          {stats.total} total incident{stats.total !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${stats.owed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.owed > 0 ? `${stats.owed} owed` : 'All delivered!'}
                      </p>
                      {stats.delivered > 0 && (
                        <p className="text-sm text-green-600">{stats.delivered} delivered</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Navigation />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage incidents={incidents} />} />
        </Routes>

        {showAddForm && (
          <AddIncidentForm
            onAdd={addIncident}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;


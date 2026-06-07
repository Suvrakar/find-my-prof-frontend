import React, { useEffect } from 'react';
import { useMatchesStore, useUserStore } from '../store';
import MatchCard from '../components/MatchCard';
import './Dashboard.css';

export default function Dashboard() {
  const { matches, loading, fetchMatches } = useMatchesStore();
  const { profile, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchMatches();
    fetchProfile();
  }, []);

  return (
    <div className="dashboard-page">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold uppercase">Total Matches</h3>
          <p className="text-3xl font-bold text-blue-600">{matches.length}</p>
        </div>
        <div className="stat-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold uppercase">Emails Sent</h3>
          <p className="text-3xl font-bold text-green-600">
            {matches.filter((m) => m.email_sent).length}
          </p>
        </div>
        <div className="stat-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold uppercase">Clicked</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {matches.filter((m) => m.clicked).length}
          </p>
        </div>
        <div className="stat-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold uppercase">Replied</h3>
          <p className="text-3xl font-bold text-purple-600">
            {matches.filter((m) => m.replied).length}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Your Matches</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your matches...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="matches-list space-y-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">
            No matches yet. Complete your profile to get personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

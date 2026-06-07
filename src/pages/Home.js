import React, { useState, useEffect } from 'react';
import { useProfessorsStore } from '../store';
import ProfessorCard from '../components/ProfessorCard';
import './Home.css';

export default function Home() {
  const { professors, loading, fetchProfessors } = useProfessorsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', affiliation: '' });

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProfessors({
      ...filters,
      search: searchTerm,
    });
  };

  return (
    <div className="home-page">
      <div className="hero-section mb-12">
        <h1 className="text-4xl font-bold text-center mb-4">
          Find Your Perfect Academic Advisor
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Discover professors aligned with your research interests using AI-powered matching
        </p>

        <form onSubmit={handleSearch} className="search-form mb-8 max-w-2xl mx-auto">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search professors by name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>

          <div className="filters flex gap-4">
            <input
              type="text"
              placeholder="Filter by department..."
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Filter by affiliation..."
              value={filters.affiliation}
              onChange={(e) => setFilters({ ...filters, affiliation: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading professors...</p>
        </div>
      ) : professors.length > 0 ? (
        <div className="professors-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professors.map((professor) => (
            <ProfessorCard key={professor.id} professor={professor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No professors found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}

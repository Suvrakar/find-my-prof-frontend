import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      onSearch('');
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search professors by name, research interests, or keywords..."
        value={searchTerm}
        onChange={handleChange}
        className="search-input"
      />
      <button type="submit" className="search-button">Search</button>
    </form>
  );
}

export default SearchBar;

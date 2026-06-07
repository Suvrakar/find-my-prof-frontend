import React from 'react';
import PropTypes from 'prop-types';
import ProfessorCard from './ProfessorCard';
import './ProfessorList.css';

function ProfessorList({ professors }) {
  if (professors.length === 0) {
    return (
      <div className="no-results">
        <p>No professors found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="professor-list">
      {professors.map((professor) => (
        <ProfessorCard key={professor.id} professor={professor} />
      ))}
    </div>
  );
}

ProfessorList.propTypes = {
  professors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

export default ProfessorList;

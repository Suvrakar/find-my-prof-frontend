import React from 'react';
import PropTypes from 'prop-types';
import './ProfessorCard.css';

function ProfessorCard({ professor }) {
  return (
    <div className="professor-card">
      <div className="card-header">
        <h3 className="professor-name">{professor.name}</h3>
        {professor.orcid && (
          <a href={`https://orcid.org/${professor.orcid}`} target="_blank" rel="noopener noreferrer" className="orcid-link">
            ORCID
          </a>
        )}
      </div>

      <div className="card-body">
        {professor.title && <p className="professor-title">{professor.title}</p>}
        
        {professor.affiliation && (
          <p className="professor-affiliation">{professor.affiliation}</p>
        )}

        {professor.department && (
          <p className="professor-department">📚 {professor.department}</p>
        )}

        {professor.email && (
          <p className="professor-email">
            📧 <a href={`mailto:${professor.email}`}>{professor.email}</a>
          </p>
        )}

        {professor.research_keywords && professor.research_keywords.length > 0 && (
          <div className="keywords">
            <strong>Research Areas:</strong>
            <div className="keyword-list">
              {professor.research_keywords.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}

        <div className="metrics">
          {professor.h_index !== null && (
            <span className="metric">
              <strong>h-index:</strong> {professor.h_index}
            </span>
          )}
          {professor.citation_count !== null && (
            <span className="metric">
              <strong>Citations:</strong> {professor.citation_count}
            </span>
          )}
        </div>
      </div>

      <div className="card-footer">
        {professor.homepage_url && (
          <a href={professor.homepage_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Visit Profile
          </a>
        )}
        <button className="btn-primary">Contact</button>
      </div>
    </div>
  );
}

ProfessorCard.propTypes = {
  professor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    affiliation: PropTypes.string,
    department: PropTypes.string,
    email: PropTypes.string,
    orcid: PropTypes.string,
    homepage_url: PropTypes.string,
    research_keywords: PropTypes.arrayOf(PropTypes.string),
    h_index: PropTypes.number,
    citation_count: PropTypes.number,
  }).isRequired,
};

export default ProfessorCard;

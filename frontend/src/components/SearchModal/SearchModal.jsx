import { useState, useContext } from 'react';
import './SearchModal.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

// eslint-disable-next-line react/prop-types
const SearchModal = ({ isOpen, onClose }) => {
  const { setSearchTerm } = useContext(StoreContext);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchTerm(searchInput.trim());
      onClose();
      // Scroll to textile display section
      setTimeout(() => {
        const textileSection = document.getElementById('textile-display');
        if (textileSection) {
          textileSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={handleOverlayClick}>
      <div className="search-modal">
        <div className="search-modal-header">
          <h3>🔍 Search Textiles</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="search-modal-form">
          <div className="search-modal-input-container">
            <img src={assets.search_icon} alt="Search" className="search-modal-icon" />
            <input
              type="text"
              placeholder="Search for textiles, fabrics, clothing..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-modal-input"
              autoFocus
            />
            <button type="submit" className="search-modal-btn">
              Search
            </button>
          </div>
        </form>

        <div className="search-suggestions">
          <p>Popular searches:</p>
          <div className="suggestion-tags">
            <button onClick={() => setSearchInput('cotton')}>Cotton</button>
            <button onClick={() => setSearchInput('silk')}>Silk</button>
            <button onClick={() => setSearchInput('denim')}>Denim</button>
            <button onClick={() => setSearchInput('wool')}>Wool</button>
            <button onClick={() => setSearchInput('linen')}>Linen</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

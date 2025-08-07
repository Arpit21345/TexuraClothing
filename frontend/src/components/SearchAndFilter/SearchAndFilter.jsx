import { useState, useEffect, useContext } from 'react';
import './SearchAndFilter.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

// eslint-disable-next-line react/prop-types
const SearchAndFilter = ({ onFilterChange, url }) => {
  const { searchTerm, setSearchTerm } = useContext(StoreContext);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState(['All']);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url}/api/textile/categories`);
        if (response.data.success) {
          setCategories(['All', ...response.data.data]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [url]);

  // Apply filters
  const applyFilters = () => {
    const filters = {
      search: searchTerm,
      category: selectedCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy,
      sortOrder,
      page: 1 // Reset to first page when filters change
    };
    onFilterChange(filters);
  };

  // Handle filter changes
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, priceRange, sortBy, sortOrder, searchTerm]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <div className="search-and-filter">
      {/* Search Term Display (if searching) */}
      {searchTerm && (
        <div className="search-display">
          <h3>🔍 Search Results for: &quot;{searchTerm}&quot;</h3>
          <button 
            onClick={() => setSearchTerm('')}
            className="clear-search-btn"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Filter Toggle Button */}
      <div className="filter-toggle">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle-btn"
        >
          🔍 Filters {showFilters ? '▼' : '▶'}
        </button>
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="filters-section">
          {/* Category Filter */}
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <label>Price Range:</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                className="price-input"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                className="price-input"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="category">Category</option>
            </select>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="active-filters">
        {searchTerm && (
          <span className="filter-tag">
            Search: &quot;{searchTerm}&quot;
            <button onClick={() => setSearchTerm('')}>×</button>
          </span>
        )}
        {selectedCategory !== 'All' && (
          <span className="filter-tag">
            Category: {selectedCategory}
            <button onClick={() => setSelectedCategory('All')}>×</button>
          </span>
        )}
        {(priceRange.min > 0 || priceRange.max < 1000) && (
          <span className="filter-tag">
            Price: ${priceRange.min} - ${priceRange.max}
            <button onClick={() => setPriceRange({ min: 0, max: 1000 })}>×</button>
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;

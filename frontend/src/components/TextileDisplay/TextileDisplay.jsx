import { useContext, useState, useEffect } from 'react';
import './TextileDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import TextileItem from '../TextileItem/TextileItem';
import SearchAndFilter from '../SearchAndFilter/SearchAndFilter';
import axios from 'axios';

// eslint-disable-next-line react/prop-types
const TextileDisplay = ({ category }) => {
  const { url } = useContext(StoreContext);
  const [filteredTextiles, setFilteredTextiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentFilters, setCurrentFilters] = useState({
    search: '',
    category: category || 'All',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 12
  });

  // Fetch filtered textiles
  const fetchFilteredTextiles = async (filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${url}/api/textile/list?${queryParams}`);
      
      if (response.data.success) {
        setFilteredTextiles(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching filtered textiles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    setCurrentFilters(updatedFilters);
    fetchFilteredTextiles(updatedFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    const updatedFilters = { ...currentFilters, page: newPage };
    setCurrentFilters(updatedFilters);
    fetchFilteredTextiles(updatedFilters);
  };

  // Update category filter when prop changes
  useEffect(() => {
    if (category) {
      const updatedFilters = { ...currentFilters, category, page: 1 };
      setCurrentFilters(updatedFilters);
      fetchFilteredTextiles(updatedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Initial load
  useEffect(() => {
    fetchFilteredTextiles(currentFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='textile-display' id='textile-display'>
      {/* Search and Filter Component */}
      <SearchAndFilter onFilterChange={handleFilterChange} url={url} />
      
      <div className="textile-display-header">
        <h2>
          {currentFilters.search ? 
            `Search Results for "${currentFilters.search}"` : 
            'Top Textile Products'
          }
          {pagination.total && (
            <span className="results-count">
              ({pagination.total} results)
            </span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <p>🔄 Loading textiles...</p>
        </div>
      ) : (
        <>
          <div className="textile-display-list">
            {filteredTextiles.length > 0 ? (
              filteredTextiles.map((item, index) => (
                <TextileItem 
                  key={index} 
                  id={item._id} 
                  name={item.name} 
                  description={item.description} 
                  price={item.price} 
                  image={item.image} 
                />
              ))
            ) : (
              <div className="no-results">
                <p>No textiles found matching your criteria.</p>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentFilters.page - 1)}
                disabled={currentFilters.page === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>
              
              <span className="pagination-info">
                Page {currentFilters.page} of {pagination.pages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentFilters.page + 1)}
                disabled={currentFilters.page === pagination.pages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TextileDisplay;
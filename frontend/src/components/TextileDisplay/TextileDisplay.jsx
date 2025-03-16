import { useContext } from 'react';
import './TextileDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import TextileItem from '../TextileItem/TextileItem';

// eslint-disable-next-line react/prop-types
const TextileDisplay = ({ category }) => {
  const { textile_list } = useContext(StoreContext);

  return (
    <div className='textile-display' id='textile-display'>
        <h2>Top Textile Products</h2>
        <div className="textile-display-list">
            {textile_list.map((item, index) => {
              if (category === "All" || category === item.category) {
                return <TextileItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} />;
              }
            })}
        </div>
    </div>
  );
};

export default TextileDisplay;
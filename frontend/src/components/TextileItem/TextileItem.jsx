import { useContext } from 'react';
import './TextileItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

// eslint-disable-next-line react/prop-types
const TextileItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  return (
    <div className='textile-item'>
        <div className="textile-item-img-container">
            <img className='textile-item-image' src={url + "/images/" + image} alt="" />
            {!cartItems[id]
                ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                : <div className='textile-item-counter'>
                    <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                    <p>{cartItems[id]}</p>
                    <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
                </div>
            }
        </div>
        <div className="textile-item-info">
            <div className="textile-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_stars} alt=""/>
            </div>
            <p className="textile-item-desc">{description}</p>
            <p className="textile-item-price">${price}</p>
        </div>
    </div>
  );
};

export default TextileItem;
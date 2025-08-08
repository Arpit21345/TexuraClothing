import { useContext } from 'react';
import './TextileItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

// eslint-disable-next-line react/prop-types
const TextileItem = ({ id, name, price, description, image, stock }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const inStock = typeof stock === 'number' ? stock : 0;

  return (
    <div className='textile-item'>
        <div className="textile-item-img-container">
            <img className='textile-item-image' src={url + "/images/" + image} alt="" />
                        {inStock === 0 && <span className="stock-flag">Out of Stock</span>}
                        {!cartItems[id]
                                ? (
                                        <img
                                            className={`add ${inStock === 0 ? 'disabled' : ''}`}
                                            onClick={() => inStock > 0 && addToCart(id)}
                                            src={assets.add_icon_white}
                                            alt=""
                                        />
                                    )
                                : (
                                        <div className='textile-item-counter'>
                                            <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                                            <p>{cartItems[id]}</p>
                                            <img
                                                onClick={() => addToCart(id)}
                                                src={assets.add_icon_green}
                                                alt=""
                                                className={cartItems[id] >= inStock ? 'disabled' : ''}
                                            />
                                        </div>
                                    )
                        }
        </div>
        <div className="textile-item-info">
            <div className="textile-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_stars} alt=""/>
            </div>
            <p className="textile-item-desc">{description}</p>
                        <p className="textile-item-price">${price}</p>
                        <p className="textile-item-stock">{inStock === 0 ? 'Out of stock' : `${inStock} in stock`}</p>
        </div>
    </div>
  );
};

export default TextileItem;
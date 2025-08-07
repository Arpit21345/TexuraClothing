import './Header.css'

const Header = () => {
  const scrollToTextiles = () => {
    const textileSection = document.getElementById('textile-display');
    if (textileSection) {
      textileSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
       <div className="header">
        <div className="header-contents">
            <h2>Discover Our Exclusive Textile Collection</h2>
            <p>Choose from a diverse range of high-quality textile products</p>
            <button onClick={scrollToTextiles}>Explore Collection</button>
        </div>
       </div>
  )
}

export default Header
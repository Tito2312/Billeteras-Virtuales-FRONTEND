import React, { useState, useEffect } from 'react';
import WalletCard from '../walletCard/WalletCard';
import './WalletCarousel.css';

const WalletCarousel = ({ wallets, onRecharge, onTransfer, onWithdraw }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerPage(1);  
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2); 
      } else {
        setCardsPerPage(3);  
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(wallets.length / cardsPerPage);

  const getCurrentWallets = () => {
    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    return wallets.slice(start, end);
  };

  const goToPrevious = () => {
    setCurrentPage(prev => {
      if (prev === 0) {
        return totalPages - 1;  
      }
      return prev - 1;
    });
  };

  const goToNext = () => {
    setCurrentPage(prev => {
      if (prev === totalPages - 1) {
        return 0;  
      }
      return prev + 1;
    });
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  const currentWallets = getCurrentWallets();
  const hasMultiplePages = totalPages > 1;

  return (
    <div className="carousel-wrapper">
      <div className="carousel-container">

        <button 
          className="carousel-nav-btn prev" 
          onClick={goToPrevious}
          aria-label="Anterior"
        >
          <span className="nav-icon">←</span>
        </button>

        <div className="carousel-grid">
          {currentWallets.map((wallet) => (
            <div key={wallet.id} className="carousel-grid-item">
<WalletCard
  key={wallet.id}
  name={wallet.name}
  type={wallet.type}
  balance={wallet.balance}
  transferKey={wallet.transferKey}
  onRecharge={() => onRecharge && onRecharge(wallet)}
  onTransfer={() => onTransfer && onTransfer(wallet)}
  onWithdraw={() => onWithdraw && onWithdraw(wallet)}
/>
            </div>
          ))}

          {currentWallets.length < cardsPerPage && (
            Array.from({ length: cardsPerPage - currentWallets.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="carousel-grid-item empty" />
            ))
          )}
        </div>

        <button 
          className="carousel-nav-btn next" 
          onClick={goToNext}
          aria-label="Siguiente"
        >
          <span className="nav-icon">→</span>
        </button>
      </div>

      {hasMultiplePages && (
        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`carousel-dot ${currentPage === idx ? 'active' : ''}`}
              onClick={() => goToPage(idx)}
              aria-label={`Ir a página ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletCarousel;

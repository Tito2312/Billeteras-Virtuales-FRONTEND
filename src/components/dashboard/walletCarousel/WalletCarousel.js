// WalletCarousel.js - Carrusel por páginas
// Muestra exactamente 3 tarjetas por página en desktop
// Al hacer clic, cambia a la página siguiente/anterior

import React, { useState, useEffect } from 'react';
import WalletCard from '../walletCard/WalletCard';
import './WalletCarousel.css';

const WalletCarousel = ({ wallets }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  
  // Detectar tamaño de pantalla para ajustar tarjetas por página
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
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(wallets.length / cardsPerPage);
  
  // Obtener las billeteras de la página actual
  const getCurrentWallets = () => {
    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    return wallets.slice(start, end);
  };
  
  // Ir a la página anterior (con ciclo)
  const goToPrevious = () => {
    setCurrentPage(prev => {
      if (prev === 0) {
        return totalPages - 1;  // Volver a la última página
      }
      return prev - 1;
    });
  };
  
  // Ir a la página siguiente (con ciclo)
  const goToNext = () => {
    setCurrentPage(prev => {
      if (prev === totalPages - 1) {
        return 0;  // Volver a la primera página
      }
      return prev + 1;
    });
  };
  
  // Ir a una página específica (dots)
  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
  };
  
  const currentWallets = getCurrentWallets();
  const hasMultiplePages = totalPages > 1;
  
  return (
    <div className="carousel-wrapper">
      <div className="carousel-container">
        {/* Botón anterior */}
        <button 
          className="carousel-nav-btn prev" 
          onClick={goToPrevious}
          aria-label="Anterior"
        >
          <span className="nav-icon">←</span>
        </button>
        
        {/* Contenedor de tarjetas */}
        <div className="carousel-grid">
          {currentWallets.map((wallet) => (
            <div key={wallet.id} className="carousel-grid-item">
              <WalletCard
                name={wallet.name}
                type={wallet.type}
                balance={wallet.balance}
              />
            </div>
          ))}
          
          {/* Si hay menos tarjetas que las que caben, mostrar placeholders vacíos */}
          {currentWallets.length < cardsPerPage && (
            Array.from({ length: cardsPerPage - currentWallets.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="carousel-grid-item empty" />
            ))
          )}
        </div>
        
        {/* Botón siguiente */}
        <button 
          className="carousel-nav-btn next" 
          onClick={goToNext}
          aria-label="Siguiente"
        >
          <span className="nav-icon">→</span>
        </button>
      </div>
      
      {/* indicadores de página */}
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
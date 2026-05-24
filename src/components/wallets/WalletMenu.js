import React, { useState, useRef, useEffect } from 'react';

const WalletMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
    setIsOpen(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
    setIsOpen(false);
  };

  return (
    <div className="wallet-menu" ref={menuRef}>
      <button className="menu-trigger" onClick={toggleMenu}>
        ⋮
      </button>

      {isOpen && (
        <div className="menu-dropdown">
          <button onClick={handleEdit}>
            ✏️ Editar
          </button>
          <button onClick={handleDelete} className="danger">
            🗑️ Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletMenu;

import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      console.log('Loading cart from localStorage:', saved);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading cart:', err);
      return [];
    }
  });

  useEffect(() => {
    console.log('Saving cart to localStorage:', cartItems);
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, type) => {
    console.log('Adding to cart:', { item, type });
    
    setCartItems(prev => {
      // PERBAIKAN: Gunakan tool_id atau reagent_id yang konsisten
      const itemId = type === 'tool' ? item.tool_id : item.reagent_id;
      
      console.log('Looking for existing item with ID:', itemId, 'and type:', type);
      
      const existing = prev.find(i => {
        const existingId = i.type === 'tool' ? i.tool_id : i.reagent_id;
        return existingId === itemId && i.type === type;
      });
      
      if (existing) {
        console.log('Item exists, incrementing quantity');
        return prev.map(i => {
          const existingId = i.type === 'tool' ? i.tool_id : i.reagent_id;
          return existingId === itemId && i.type === type
            ? { ...i, quantity: i.quantity + 1 }
            : i;
        });
      }
      
      console.log('Item is new, adding to cart');
      // PENTING: Pastikan semua property tersimpan
      const newItem = {
        ...item,
        type,
        quantity: 1,
        // Pastikan ID ada
        ...(type === 'tool' ? { tool_id: item.tool_id } : { reagent_id: item.reagent_id })
      };
      
      console.log('New item object:', newItem);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id, type) => {
    console.log('Removing from cart:', { id, type });
    
    setCartItems(prev => prev.filter(i => {
      const itemId = i.type === 'tool' ? i.tool_id : i.reagent_id;
      const shouldRemove = itemId === id && i.type === type;
      console.log('Checking item:', itemId, 'Should remove:', shouldRemove);
      return !shouldRemove;
    }));
  };

  const updateQuantity = (id, type, change) => {
    console.log('Updating quantity:', { id, type, change });
    
    setCartItems(prev => prev.map(i => {
      const itemId = i.type === 'tool' ? i.tool_id : i.reagent_id;
      if (itemId === id && i.type === type) {
        const maxStock = i.type === 'tool' 
          ? (i.available_stock || i.total_stock || 999) 
          : (i.stock_quantity || 999);
        const newQty = Math.max(1, Math.min(maxStock, i.quantity + change));
        console.log('New quantity:', newQty, 'Max stock:', maxStock);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getCartCount = () => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Cart count:', count);
    return count;
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.type === 'tool' ? item.hourly_rate : item.price_per_unit;
      return sum + (parseFloat(price || 0) * item.quantity);
    }, 0);
    console.log('Cart total:', total);
    return total;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartCount,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
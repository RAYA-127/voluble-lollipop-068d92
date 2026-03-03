import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return [];
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, tenure) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product._id && item.tenure === tenure
      )

      if (existingIndex >= 0) {
        return prev
      }

      return [...prev, {
        productId: product._id,
        name: product.name,
        image: product.images[0],
        tenure,
        monthlyRent: tenure === 3 
          ? product.monthlyRent3Month 
          : tenure === 6 
            ? product.monthlyRent6Month 
            : product.monthlyRent12Month,
        securityDeposit: product.securityDeposit,
        total: (tenure === 3 
          ? product.monthlyRent3Month 
          : tenure === 6 
            ? product.monthlyRent6Month 
            : product.monthlyRent12Month) * tenure
      }]
    })
  }

  const removeFromCart = (productId, tenure) => {
    setCart(prev => prev.filter(
      item => !(item.productId === productId && item.tenure === tenure)
    ))
  }

  const updateTenure = (productId, newTenure, product) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const monthlyRent = newTenure === 3 
          ? product.monthlyRent3Month 
          : newTenure === 6 
            ? product.monthlyRent6Month 
            : product.monthlyRent12Month
        return {
          ...item,
          tenure: newTenure,
          monthlyRent,
          total: monthlyRent * newTenure
        }
      }
      return item
    }))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0)
  }

  const getSecurityDepositTotal = () => {
    return cart.reduce((total, item) => total + item.securityDeposit, 0)
  }

  const getCartItemCount = () => {
    return cart.length
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateTenure,
      clearCart,
      getCartTotal,
      getSecurityDepositTotal,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

import { createContext, useContext, useState, useEffect } from "react";

//Crear un contexto
const CartContext = createContext();

//Hook personalizado del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

// Provider del carrito
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Cargar carrito del localStronge al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Guardar el localStronge al cambiar el carrito
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Agregar productos al carrito
  const addToCart = (producto) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === producto.id);

      if (existingItem) {
        // Si ya existe, aumenta la cantidad
        return prevItems.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si no existe, agrega el nuevo producto
        return [...prevItems, { ...producto, cantidad: 1 }];
      }
    });
  };

  // Eliminar productos del carrito
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  // Actualizar la cantidad
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, cantidad: newQuantity } : item
        )
      );
    }
  };

  // Limpiar el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Calcular el total del carrito
  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      const precio =
        item.descuento > 0
          ? item.precio * (1 - item.descuento / 100)
          : item.precio;
      return total + precio * item.cantidad;
    }, 0);
  };

  // Contar items totales
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.cantidad, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

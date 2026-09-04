"use client"
import { createContext, useContext, useEffect, useRef, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const isHydrated = useRef(false);

  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const storedItemCount = parseInt(localStorage.getItem("itemCount")) || 0;
    const storedTotalPrice =
      parseFloat(localStorage.getItem("totalPrice")) || 0;

    setCartItems(storedCartItems);
    setItemCount(storedItemCount);
    setTotalPrice(storedTotalPrice);
    isHydrated.current = true;
  }, []);

  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      const merged = isHydrated.current
        ? [...prevCartItems, product]
        : [...JSON.parse(localStorage.getItem("cartItems") || "[]"), product];
      localStorage.setItem("cartItems", JSON.stringify(merged));
      return merged;
    });
    setItemCount((prevItemCount) => {
      const newItemCount = isHydrated.current
        ? prevItemCount + 1
        : (JSON.parse(localStorage.getItem("itemCount") || "0") || 0) + 1;
      localStorage.setItem("itemCount", newItemCount.toString());
      return newItemCount;
    });
    setTotalPrice((prevTotalPrice) => {
      const newTotalPrice = isHydrated.current
        ? prevTotalPrice + product.price
        : (parseFloat(localStorage.getItem("totalPrice") || "0") || 0) + product.price;
      localStorage.setItem("totalPrice", newTotalPrice.toString());
      return newTotalPrice;
    });
  };

  const removeFromCart = (product) => {
    setCartItems((prevCartItems) => {
      const merged = isHydrated.current
        ? [...prevCartItems]
        : [...JSON.parse(localStorage.getItem("cartItems") || "[]")];
      const index = merged.findIndex((item) => item.id === product.id);
      if (index === -1) return merged;

      merged.splice(index, 1);
      localStorage.setItem("cartItems", JSON.stringify(merged));
      return merged;
    });

    setItemCount((prevItemCount) => {
      const newCount = isHydrated.current
        ? prevItemCount - 1
        : Math.max(0, (JSON.parse(localStorage.getItem("itemCount") || "0") || 0) - 1);
      localStorage.setItem("itemCount", newCount.toString());
      return newCount;
    });

    setTotalPrice((prevTotalPrice) => {
      const items = isHydrated.current ? cartItems : JSON.parse(localStorage.getItem("cartItems") || "[]");
      const removedItem = items.find((item) => item.id === product.id);
      if (!removedItem) return prevTotalPrice;
      const newPrice = isHydrated.current
        ? prevTotalPrice - removedItem.price
        : Math.max(0, (parseFloat(localStorage.getItem("totalPrice") || "0") || 0) - removedItem.price);
      localStorage.setItem("totalPrice", newPrice.toString());
      return newPrice;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setItemCount(0);
    setTotalPrice(0);
    localStorage.removeItem("cartItems");
    localStorage.removeItem("itemCount");
    localStorage.removeItem("totalPrice");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

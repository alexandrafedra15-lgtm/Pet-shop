import React, { createContext, useState, useEffect } from 'react';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  // Load initial cart state from localStorage
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('carrito');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync cart changes to localStorage
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      const existingIndex = prev.findIndex((item) => item.producto.id === producto.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].cantidad += cantidad;
        return next;
      }
      return [...prev, { producto, cantidad }];
    });
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    setCarrito((prev) =>
      prev.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const cantidadTotal = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const costoTotal = carrito.reduce((sum, item) => sum + (item.cantidad * parseFloat(item.producto.precio)), 0);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        limpiarCarrito,
        cantidadTotal,
        costoTotal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

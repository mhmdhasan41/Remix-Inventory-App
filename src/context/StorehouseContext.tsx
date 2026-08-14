import React, { createContext, useContext, useState } from 'react';

interface StorehouseContextType {
  selectedStorehouse: string;
  setSelectedStorehouse: (storehouse: string) => void;
}

const StorehouseContext = createContext<StorehouseContextType>({
  selectedStorehouse: 'all',
  setSelectedStorehouse: () => {},
});

export const StorehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStorehouse, setSelectedStorehouseState] = useState<string>(() => {
    return localStorage.getItem('inventory_app_storehouse_filter') || 'all';
  });

  const setSelectedStorehouse = (storehouse: string) => {
    setSelectedStorehouseState(storehouse);
    localStorage.setItem('inventory_app_storehouse_filter', storehouse);
  };

  return (
    <StorehouseContext.Provider value={{ selectedStorehouse, setSelectedStorehouse }}>
      {children}
    </StorehouseContext.Provider>
  );
};

export const useStorehouse = () => useContext(StorehouseContext);

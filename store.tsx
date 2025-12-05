import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Dish, Cuisine, CustomerRole } from './types';

interface AppContextType {
  // State
  customers: Customer[];
  cuisines: Cuisine[];
  dishes: Dish[];
  
  // Actions
  addCuisine: (c: Omit<Cuisine, 'id'>) => void;
  deleteCuisine: (id: string) => void;
  
  addDish: (d: Omit<Dish, 'id'>) => void;
  deleteDish: (id: string) => void;
  
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  deleteCustomer: (id: string) => void;
  updateCustomerBalance: (id: string, newBalance: number) => void;
  
  // Client Logic
  currentUser: Customer | null;
  login: (name: string) => boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_CUISINES: Cuisine[] = [
  { id: 'c1', name: 'Sichuan', description: 'Spicy and numbing flavors' },
  { id: 'c2', name: 'Cantonese', description: 'Fresh and delicate taste' },
  { id: 'c3', name: 'Fast Food', description: 'Quick bites and burgers' },
];

const INITIAL_DISHES: Dish[] = [
  { id: 'd1', cuisineId: 'c1', name: 'Mapo Tofu', description: 'Tofu set in a spicy sauce with minced meat', price: 12.99, imageUrl: 'https://picsum.photos/200/200?random=1' },
  { id: 'd2', cuisineId: 'c1', name: 'Kung Pao Chicken', description: 'Spicy stir-fry with chicken, peanuts, and vegetables', price: 15.50, imageUrl: 'https://picsum.photos/200/200?random=2' },
  { id: 'd3', cuisineId: 'c2', name: 'Dim Sum Platter', description: 'Assortment of steamed buns and dumplings', price: 22.00, imageUrl: 'https://picsum.photos/200/200?random=3' },
  { id: 'd4', cuisineId: 'c3', name: 'Cheeseburger', description: 'Classic beef burger with cheddar', price: 8.99, imageUrl: 'https://picsum.photos/200/200?random=4' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'u1', name: 'Elon', role: CustomerRole.SUPER_VIP, balance: 1000 },
  { id: 'u2', name: 'Bob', role: CustomerRole.REGULAR, balance: 50 },
  { id: 'u3', name: 'Karen', role: CustomerRole.ANNOYING, balance: -15 },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [cuisines, setCuisines] = useState<Cuisine[]>(INITIAL_CUISINES);
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);

  // Admin Actions
  const addCuisine = (c: Omit<Cuisine, 'id'>) => {
    const newCuisine = { ...c, id: Math.random().toString(36).substr(2, 9) };
    setCuisines([...cuisines, newCuisine]);
  };

  const deleteCuisine = (id: string) => {
    setCuisines(cuisines.filter(c => c.id !== id));
    // Also remove dishes related to this cuisine? Optional, keeping simple for now.
    setDishes(dishes.filter(d => d.cuisineId !== id));
  };

  const addDish = (d: Omit<Dish, 'id'>) => {
    const newDish = { ...d, id: Math.random().toString(36).substr(2, 9) };
    setDishes([...dishes, newDish]);
  };

  const deleteDish = (id: string) => {
    setDishes(dishes.filter(d => d.id !== id));
  };

  const addCustomer = (c: Omit<Customer, 'id'>) => {
    if (customers.some(existing => existing.name === c.name)) {
      alert('Customer name must be unique!');
      return;
    }
    const newCustomer = { ...c, id: Math.random().toString(36).substr(2, 9) };
    setCustomers([...customers, newCustomer]);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const updateCustomerBalance = (id: string, newBalance: number) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, balance: newBalance } : c));
    // If current user is the one being updated
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }
  };

  // Client Actions
  const login = (name: string): boolean => {
    const found = customers.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };
  
  const refreshUser = () => {
     if(currentUser) {
         const fresh = customers.find(c => c.id === currentUser.id);
         if(fresh) setCurrentUser(fresh);
     }
  }

  return (
    <AppContext.Provider value={{
      customers, cuisines, dishes,
      addCuisine, deleteCuisine,
      addDish, deleteDish,
      addCustomer, deleteCustomer, updateCustomerBalance,
      currentUser, login, logout, refreshUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};

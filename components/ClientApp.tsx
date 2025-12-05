import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Dish, CartItem, CustomerRole } from '../types';
import { ShoppingCart, LogOut, Wallet, Minus, Plus, Search } from 'lucide-react';

export const ClientApp: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <ClientLogin onExit={onExit} />;
  }

  return <ClientMenu onExit={onExit} />;
};

const ClientLogin: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { login } = useAppStore();
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(inputName)) {
      setError('');
    } else {
      setError('Customer not found. Please ask Admin to register you.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Michelin</h1>
            <p className="text-gray-500">Welcome, please check in.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="e.g. Elon"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition">
            Start Ordering
          </button>
        </form>
        <button onClick={onExit} className="mt-4 w-full text-gray-400 text-sm">Back to Home</button>
      </div>
    </div>
  );
};

const ClientMenu: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { cuisines, dishes, currentUser, updateCustomerBalance, logout } = useAppStore();
  const [selectedCuisineId, setSelectedCuisineId] = useState<string>(cuisines[0]?.id || '');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Derived state
  const filteredDishes = useMemo(() => 
    dishes.filter(d => d.cuisineId === selectedCuisineId), 
  [dishes, selectedCuisineId]);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((total: number, [dishId, qty]: [string, number]) => {
      const dish = dishes.find(d => d.id === dishId);
      return total + (dish ? dish.price * qty : 0);
    }, 0);
  }, [cart, dishes]);

  const cartItemCount = Object.values(cart).reduce((a: number, b: number) => a + b, 0);

  // Handlers
  const addToCart = (dishId: string) => {
    setCart(prev => ({ ...prev, [dishId]: (prev[dishId] || 0) + 1 }));
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => {
      const newQty = (prev[dishId] || 0) - 1;
      if (newQty <= 0) {
        const { [dishId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dishId]: newQty };
    });
  };

  const handleCheckout = () => {
    if (!currentUser) return;
    
    // Logic: Allow overdraft ONCE. 
    // Defined as: If user currently has negative balance, they cannot checkout.
    // If they have positive (or zero) balance, they can checkout even if it pushes them to negative.
    
    if (currentUser.balance < 0) {
      alert("Checkout failed: Your balance is negative. Please recharge at the counter.");
      return;
    }

    const newBalance = currentUser.balance - cartTotal;
    updateCustomerBalance(currentUser.id, newBalance);
    setCart({});
    setIsCartOpen(false);
    alert(`Order placed! New Balance: $${newBalance.toFixed(2)}`);
  };

  // Render Helpers
  const renderCartModal = () => (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md sm:mx-auto sm:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-bold text-lg">Your Order</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-500">Close</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(cart).map(([id, qty]) => {
                const dish = dishes.find(d => d.id === id);
                if(!dish) return null;
                return (
                    <div key={id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={dish.imageUrl} className="w-12 h-12 rounded bg-gray-200 object-cover" />
                            <div>
                                <p className="font-medium">{dish.name}</p>
                                <p className="text-sm text-gray-500">${dish.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => removeFromCart(id)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold">-</button>
                            <span className="w-4 text-center">{qty}</span>
                            <button onClick={() => addToCart(id)} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">+</button>
                        </div>
                    </div>
                )
            })}
            {Object.keys(cart).length === 0 && <p className="text-center text-gray-500 py-8">Your cart is empty.</p>}
        </div>

        <div className="p-4 bg-white border-t space-y-3">
            <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
                <span>Current Balance</span>
                <span className={currentUser?.balance && currentUser.balance < 0 ? 'text-red-500' : 'text-green-600'}>
                    ${currentUser?.balance.toFixed(2)}
                </span>
            </div>
            {currentUser && currentUser.balance < 0 && (
                <div className="bg-red-50 text-red-600 p-2 text-xs rounded text-center">
                    Insufficient funds. Overdraft limit reached.
                </div>
            )}
            <button 
                onClick={handleCheckout}
                disabled={cartItemCount === 0 || (currentUser ? currentUser.balance < 0 : true)}
                className={`w-full py-3 rounded-lg font-bold text-white transition ${
                    cartItemCount === 0 || (currentUser?.balance || 0) < 0
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-orange-700 shadow-lg shadow-orange-200'
                }`}
            >
                Pay & Order
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <span className="font-bold text-gray-800">Michelin</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
                <Wallet size={14} className="text-gray-500"/>
                <span className={`font-bold ${currentUser?.balance && currentUser.balance < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                    ${currentUser?.balance.toFixed(2)}
                </span>
            </div>
            <button onClick={() => { logout(); onExit(); }} className="text-gray-400 hover:text-gray-600">
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + List */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Cuisines) */}
        <aside className="w-1/4 min-w-[90px] bg-gray-50 overflow-y-auto border-r scrollbar-hide">
            {cuisines.map(c => (
                <button
                    key={c.id}
                    onClick={() => setSelectedCuisineId(c.id)}
                    className={`w-full p-4 text-xs sm:text-sm font-medium text-left border-l-4 transition-all ${
                        selectedCuisineId === c.id 
                        ? 'bg-white border-primary text-gray-900' 
                        : 'border-transparent text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    {c.name}
                </button>
            ))}
        </aside>

        {/* Right Content (Dishes) */}
        <main className="flex-1 overflow-y-auto p-4 bg-white relative">
            <h2 className="font-bold text-lg mb-4 text-gray-800 sticky top-0 bg-white/95 backdrop-blur py-2 z-10">
                {cuisines.find(c => c.id === selectedCuisineId)?.name}
            </h2>
            <div className="grid grid-cols-1 gap-6 pb-20">
                {filteredDishes.map(dish => (
                    <div key={dish.id} className="flex gap-4">
                        <img src={dish.imageUrl} alt={dish.name} className="w-24 h-24 rounded-lg object-cover bg-gray-100 shrink-0" />
                        <div className="flex-1 flex flex-col justify-between h-24 py-1">
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{dish.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{dish.description}</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-lg text-gray-900">${dish.price}</span>
                                {cart[dish.id] ? (
                                     <div className="flex items-center gap-3">
                                        <button onClick={() => removeFromCart(dish.id)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500"><Minus size={14}/></button>
                                        <span className="text-sm font-medium">{cart[dish.id]}</span>
                                        <button onClick={() => addToCart(dish.id)} className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"><Plus size={14}/></button>
                                     </div>
                                ) : (
                                    <button onClick={() => addToCart(dish.id)} className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                        ADD
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filteredDishes.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">No dishes in this category</div>
                )}
            </div>
        </main>
      </div>

      {/* Sticky Cart Bar */}
      {cartItemCount > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-secondary text-white p-4 rounded-full shadow-xl flex justify-between items-center px-6 animate-fade-in-up"
              >
                  <div className="flex items-center gap-3">
                      <div className="bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {cartItemCount}
                      </div>
                      <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wide">View Cart</span>
              </button>
          </div>
      )}

      {isCartOpen && renderCartModal()}
    </div>
  );
};
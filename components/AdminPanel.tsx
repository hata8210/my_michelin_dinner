import React, { useState } from 'react';
import { useAppStore } from '../store';
import { CustomerRole } from '../types';
import { Trash2, Plus, DollarSign, Upload, Users, UtensilsCrossed, ChefHat, LogOut } from 'lucide-react';

export const AdminPanel: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'cuisines' | 'dishes' | 'customers'>('cuisines');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-secondary text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <button onClick={onExit} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
            <LogOut size={16} /> Exit
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex justify-around max-w-4xl mx-auto">
          <TabButton 
            active={activeTab === 'cuisines'} 
            onClick={() => setActiveTab('cuisines')} 
            icon={<UtensilsCrossed size={18} />} 
            label="Cuisines" 
          />
          <TabButton 
            active={activeTab === 'dishes'} 
            onClick={() => setActiveTab('dishes')} 
            icon={<ChefHat size={18} />} 
            label="Dishes" 
          />
          <TabButton 
            active={activeTab === 'customers'} 
            onClick={() => setActiveTab('customers')} 
            icon={<Users size={18} />} 
            label="Customers" 
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            {activeTab === 'cuisines' && <CuisinesManager />}
            {activeTab === 'dishes' && <DishesManager />}
            {activeTab === 'customers' && <CustomersManager />}
        </div>
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 flex flex-col items-center gap-1 text-sm font-medium transition-colors border-b-2 ${
      active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// --- Sub-Managers ---

const CuisinesManager = () => {
  const { cuisines, addCuisine, deleteCuisine } = useAppStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addCuisine({ name, description: desc });
    setName('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-3">
        <h3 className="font-semibold text-lg mb-2">Add New Cuisine</h3>
        <input 
          placeholder="Cuisine Name" 
          className="w-full p-2 border rounded" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        <input 
          placeholder="Description" 
          className="w-full p-2 border rounded" 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 w-full justify-center">
          <Plus size={16} /> Add Cuisine
        </button>
      </form>

      <div className="grid gap-3">
        {cuisines.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h4 className="font-bold">{c.name}</h4>
              <p className="text-sm text-gray-500">{c.description}</p>
            </div>
            <button onClick={() => deleteCuisine(c.id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {cuisines.length === 0 && <p className="text-center text-gray-500">No cuisines added yet.</p>}
      </div>
    </div>
  );
};

const DishesManager = () => {
  const { dishes, cuisines, addDish, deleteDish } = useAppStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [cuisineId, setCuisineId] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Create a fake local URL for the session
      const url = URL.createObjectURL(e.target.files[0]);
      setImageFile(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !cuisineId) return;
    
    addDish({
      name,
      description: desc,
      price: parseFloat(price),
      cuisineId,
      imageUrl: imageFile || `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`
    });

    setName('');
    setDesc('');
    setPrice('');
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-3">
        <h3 className="font-semibold text-lg mb-2">Add New Dish</h3>
        
        <div className="grid grid-cols-2 gap-2">
            <select 
              className="p-2 border rounded w-full" 
              value={cuisineId} 
              onChange={e => setCuisineId(e.target.value)}
              required
            >
            <option value="">Select Cuisine</option>
            {cuisines.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
                type="number" 
                placeholder="Price" 
                className="p-2 border rounded w-full" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                step="0.01"
                required
            />
        </div>

        <input 
          placeholder="Dish Name" 
          className="w-full p-2 border rounded" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Description" 
          className="w-full p-2 border rounded" 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
        />
        
        <div className="flex items-center gap-2">
           <label className="flex items-center gap-2 p-2 border rounded cursor-pointer bg-gray-50 hover:bg-gray-100 flex-1 justify-center">
              <Upload size={16} />
              <span className="text-sm">Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
           </label>
           {imageFile && <div className="text-xs text-green-600">Selected</div>}
        </div>

        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 w-full justify-center">
          <Plus size={16} /> List Dish
        </button>
      </form>

      <div className="grid gap-3">
        {dishes.map(d => {
            const cuisine = cuisines.find(c => c.id === d.cuisineId);
            return (
                <div key={d.id} className="bg-white p-3 rounded-lg shadow flex gap-3">
                    <img src={d.imageUrl} alt={d.name} className="w-20 h-20 object-cover rounded bg-gray-200" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold">{d.name}</h4>
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">{cuisine?.name || 'Unknown'}</span>
                            </div>
                            <span className="font-bold text-primary">${d.price.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{d.description}</p>
                    </div>
                    <button onClick={() => deleteDish(d.id)} className="self-center text-red-500 p-2 hover:bg-red-50 rounded">
                        <Trash2 size={20} />
                    </button>
                </div>
            );
        })}
      </div>
    </div>
  );
};

const CustomersManager = () => {
  const { customers, addCustomer, deleteCustomer, updateCustomerBalance } = useAppStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState<CustomerRole>(CustomerRole.REGULAR);
  const [editBalanceId, setEditBalanceId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addCustomer({ name, role, balance: 0 });
    setName('');
    setRole(CustomerRole.REGULAR);
  };

  const handleBalanceUpdate = (id: string) => {
      if(!editAmount) return;
      updateCustomerBalance(id, parseFloat(editAmount));
      setEditBalanceId(null);
      setEditAmount('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow space-y-3">
        <h3 className="font-semibold text-lg mb-2">Register Customer</h3>
        <div className="grid grid-cols-2 gap-2">
            <input 
            placeholder="Name (Unique)" 
            className="w-full p-2 border rounded" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            />
            <select 
                className="w-full p-2 border rounded"
                value={role}
                onChange={e => setRole(e.target.value as CustomerRole)}
            >
                {Object.values(CustomerRole).map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
        </div>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 w-full justify-center">
          <Plus size={16} /> Add Customer
        </button>
      </form>

      <div className="grid gap-3">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                        {c.name}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                            c.role === CustomerRole.SUPER_VIP ? 'bg-purple-100 text-purple-800' :
                            c.role === CustomerRole.ANNOYING ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                        }`}>{c.role}</span>
                    </h4>
                </div>
                <button onClick={() => deleteCustomer(c.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                </button>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-gray-600 text-sm">Balance:</span>
                {editBalanceId === c.id ? (
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            className="w-20 p-1 border rounded text-right" 
                            autoFocus
                            placeholder={c.balance.toString()}
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                        />
                        <button onClick={() => handleBalanceUpdate(c.id)} className="text-green-600 font-bold text-xs">SAVE</button>
                        <button onClick={() => setEditBalanceId(null)} className="text-gray-400 text-xs">X</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${c.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${c.balance.toFixed(2)}
                        </span>
                        <button onClick={() => { setEditBalanceId(c.id); setEditAmount(c.balance.toString()); }} className="text-primary hover:bg-orange-100 p-1 rounded">
                            <DollarSign size={14} />
                        </button>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

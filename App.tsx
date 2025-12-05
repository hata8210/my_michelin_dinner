import React, { useState } from 'react';
import { ViewState } from './types';
import { AppProvider } from './store';
import { AdminPanel } from './components/AdminPanel';
import { ClientApp } from './components/ClientApp';
import { Utensils, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');

  const renderView = () => {
    switch (view) {
      case 'ADMIN':
        return <AdminPanel onExit={() => setView('LANDING')} />;
      case 'CLIENT_APP':
      case 'CLIENT_LOGIN':
        return <ClientApp onExit={() => setView('LANDING')} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center text-white p-6">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-4 tracking-tight">Michelin</h1>
              <p className="text-orange-100 text-lg">Next Gen Restaurant Experience</p>
            </div>
            
            <div className="grid gap-6 w-full max-w-sm">
              <button 
                onClick={() => setView('CLIENT_APP')}
                className="bg-white text-orange-600 p-6 rounded-2xl shadow-xl flex items-center gap-4 hover:scale-105 transition-transform group"
              >
                <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition">
                  <Utensils size={32} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">I'm Hungry</h2>
                  <p className="text-sm text-gray-500">Enter Client App</p>
                </div>
              </button>

              <button 
                onClick={() => setView('ADMIN')}
                className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-6 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition group"
              >
                 <div className="bg-white/20 p-3 rounded-full">
                  <ShieldCheck size={32} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold">Management</h2>
                  <p className="text-sm text-orange-200">Admin Dashboard</p>
                </div>
              </button>
            </div>

            <footer className="absolute bottom-6 text-orange-200 text-sm">
              &copy; 2024 Michelin Systems
            </footer>
          </div>
        );
    }
  };

  return (
    <AppProvider>
      {renderView()}
    </AppProvider>
  );
};

export default App;
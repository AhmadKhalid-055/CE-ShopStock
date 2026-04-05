
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, ShieldCheck, Database, CloudOff, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SalesPortal from './components/SalesPortal';
import MasterData from './components/MasterData';
import Analytics from './components/Analytics';
import Sidebar from './components/Sidebar';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 1. HARD-WIRED LOCAL RECOVERY (UNBREAKABLE INITIALIZATION)
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('ch_categories');
    return saved ? JSON.parse(saved) : ['Mobiles', 'Laptops', 'Accessories'];
  });
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('ch_companies');
    return saved ? JSON.parse(saved) : [];
  });
  const [models, setModels] = useState(() => {
    const saved = localStorage.getItem('ch_models');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('ch_products');
    return saved ? JSON.parse(saved) : [];
  });
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('ch_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ch_settings');
    return saved ? JSON.parse(saved) : { cashMemo: 'AABC', invoiceNo: '1001' };
  });

  // 2. AUTOMATIC LOCAL SAVE
  useEffect(() => {
    localStorage.setItem('ch_categories', JSON.stringify(categories));
    localStorage.setItem('ch_companies', JSON.stringify(companies));
    localStorage.setItem('ch_models', JSON.stringify(models));
    localStorage.setItem('ch_products', JSON.stringify(products));
    localStorage.setItem('ch_sales', JSON.stringify(sales));
    localStorage.setItem('ch_settings', JSON.stringify(settings));
  }, [categories, companies, models, products, sales, settings]);

  // 3. CLOUD SYNC THROUGH GLOBAL GATEWAY
  useEffect(() => {
    const syncCloud = async () => {
      try {
        if (!window.supabase) {
           setTimeout(syncCloud, 500); // Retry if CDN is lagging
           return;
        }

        const supabase = window.supabase.createClient(
          'https://autdxusurvezwdeitlvo.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dGR4dXN1cnZlendkZWl0bHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjU1ODUsImV4cCI6MjA5MDgwMTU4NX0.4dVtqRYLA3xI9Yij-7-taaw7iN9Eq1Imf2jnPyFxiHw'
        );

        const { data: p } = await supabase.from('products').select('*');
        const { data: s } = await supabase.from('sales').select('*');
        const { data: c } = await supabase.from('categories').select('*');

        if (c && c.length > 0) setCategories(prev => [...new Set([...prev, ...c.map(t => t.name)])]);
        if (p && p.length > products.length) setProducts(p);
        if (s && s.length > sales.length) setSales(s);

        setDbStatus('Cloud Online 🟢');
        console.log("✅ CLOUD CONNECTED VIA CDN");
      } catch (e) {
        setDbStatus('Local Mode 📵');
        console.warn("⚠️ Using Local Records.");
      } finally {
        setLoading(false);
      }
    };
    syncCloud();
  }, []);

  const getClient = () => {
    return window.supabase.createClient(
      'https://autdxusurvezwdeitlvo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dGR4dXN1cnZlendkZWl0bHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjU1ODUsImV4cCI6MjA5MDgwMTU4NX0.4dVtqRYLA3xI9Yij-7-taaw7iN9Eq1Imf2jnPyFxiHw'
    );
  };

  const addCategory = async (name) => {
    setCategories(prev => [...prev, name]);
    const sb = getClient();
    await sb.from('categories').insert([{ name }]);
  };

  const addCompany = async (comp) => {
    const item = { id: Date.now().toString(), ...comp };
    setCompanies(prev => [...prev, item]);
    const sb = getClient();
    await sb.from('companies').insert([comp]);
  };

  const addModel = async (mod) => {
    const item = { id: Date.now().toString(), ...mod };
    setModels(prev => [...prev, item]);
    const sb = getClient();
    await sb.from('models').insert([mod]);
  };

  const addProduct = async (prod) => {
    const payload = { ...prod, id: Date.now().toString(), status: prod.stock > 0 ? 'In Stock' : 'Out of Stock' };
    setProducts(prev => [payload, ...prev]);
    const sb = getClient();
    await sb.from('products').insert([prod]);
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    const sb = getClient();
    await sb.from('products').delete().eq('id', id);
  };

  const updateProduct = async (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    const sb = getClient();
    const { id, ...dataToUpdate } = updatedProduct;
    await sb.from('products').update(dataToUpdate).eq('id', updatedProduct.id);
  };

  const addSale = async (sale) => {
    setSales(prev => [sale, ...prev]);
    setProducts(prev => prev.map(p => {
       const soldCount = sale.items.filter(si => si.productId === p.id).length;
       if (soldCount > 0) {
          const ns = p.stock - soldCount;
          return { ...p, stock: ns, status: ns > 0 ? 'In Stock' : 'Out of Stock' };
       }
       return p;
    }));
    const sb = getClient();
    await sb.from('sales').insert([sale]);
  };

  const deleteSale = async (id) => {
    setSales(prev => prev.filter(s => s.id !== id));
    const sb = getClient();
    await sb.from('sales').delete().eq('id', id);
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-screen-premium">
         <div className="loader-container">
            <div className="pulse-aura"></div>
            <div className="loader-content">
               <ShieldCheck className="loader-logo" size={64} />
               <h2>Choudhary Electronics</h2>
               <div className="loader-line"></div>
               <p>Initializing Secure Store Engine...</p>
            </div>
         </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard products={products} sales={sales} />;
      case 'inventory': return <Inventory products={products} onAddProduct={addProduct} onDeleteProduct={deleteProduct} onUpdateProduct={updateProduct} categories={categories} companies={companies} models={models} />;
      case 'categories': return <MasterData categories={categories} companies={companies} models={models} onAddCategory={addCategory} onAddCompany={addCompany} onAddModel={addModel} />;
      case 'sales': return <SalesPortal products={products} sales={sales} onAddSale={(sale) => { addSale(sale); const curr = parseInt(settings.invoiceNo); if (!isNaN(curr)) setSettings(prev => ({...prev, invoiceNo: (curr + 1).toString()})); }} onDeleteSale={deleteSale} onUpdateSale={()=>{}} persistentSettings={{invoiceNo: settings.invoiceNo || '1001', cashMemo: settings.cashMemo}} onUpdateSettings={(newSet) => setSettings(prev => ({...prev, ...newSet}))} />;
      case 'analytics': return <Analytics sales={sales} products={products} />;
      default: return <Dashboard products={products} sales={sales} />;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
       <div className="mobile-navbar">
          <div className="brand">
             <ShoppingBag size={24} color="var(--primary)" />
             <h2>CHOUDHARY <span>E.</span></h2>
          </div>
          <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Menu">
             {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
       </div>
       {isSidebarOpen && (
         <div className="sidebar-overlay active" onClick={() => setIsSidebarOpen(false)}></div>
       )}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} isOpen={isSidebarOpen} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;

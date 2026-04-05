import React, { useState } from 'react';
import { Plus, Tag, Building2, PackageCheck, Eye, EyeOff } from 'lucide-react';
import SearchableInput from './SearchableInput';
import './MasterData.css';

const MasterData = ({ categories, companies, models, onAddCategory, onAddCompany, onAddModel }) => {
  const [newCat, setNewCat] = useState('');
  const [newCompany, setNewCompany] = useState({ name: '', category: '' });
  const [newModel, setNewModel] = useState({ name: '', company: '', category: '' });

  const [showCategories, setShowCategories] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [showModels, setShowModels] = useState(false);

  const handleAddCat = () => {
    if (newCat) {
      onAddCategory(newCat);
      setNewCat('');
    }
  };

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.category) {
      onAddCompany(newCompany);
      setNewCompany({ name: '', category: '' });
    }
  };

  const handleAddModel = () => {
    if (newModel.name && newModel.company && newModel.category) {
      onAddModel(newModel);
      setNewModel({ name: '', company: '', category: '' });
    }
  };

  return (
    <div className="master-data fade-in">
      <header className="master-header">
        <div className="header-text">
           <h1>Master Data Setup</h1>
           <p>Configure your shop categories, brands, and models.</p>
        </div>
      </header>

      <div className="setup-grid">
        {/* CATEGORIES */}
        <section className="setup-card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Tag size={20} />
              <h3>CATEGORIES</h3>
            </div>
            <button 
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}
              onClick={() => setShowCategories(!showCategories)}
            >
              {showCategories ? <><EyeOff size={16}/> Hide</> : <><Eye size={16}/> Show</>}
            </button>
          </div>
          <div className="setup-input-group">
            <input 
              type="text" 
              placeholder="Ex: Mobiles, Laptops..." 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <button className="btn primary" onClick={handleAddCat}>
              <Plus size={18} />
            </button>
          </div>
          {showCategories && (
            <div className="item-list scrollable" style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
              {categories.map((c, i) => <span key={i} className="chip">{c}</span>)}
            </div>
          )}
        </section>

        {/* COMPANIES / BRANDS */}
        <section className="setup-card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building2 size={20} />
              <h3>COMPANIES / BRANDS</h3>
            </div>
            <button 
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}
              onClick={() => setShowCompanies(!showCompanies)}
            >
              {showCompanies ? <><EyeOff size={16}/> Hide</> : <><Eye size={16}/> Show</>}
            </button>
          </div>
          <div className="setup-input-stack">
            <SearchableInput
              options={categories}
              value={newCompany.category}
              onChange={(val) => setNewCompany({ ...newCompany, category: val })}
              placeholder="Select or type Category"
            />
            <div className="setup-input-group">
              <input 
                type="text" 
                placeholder="Ex: Apple, Samsung..." 
                value={newCompany.name}
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
              />
              <button className="btn primary" onClick={handleAddCompany}>
                <Plus size={18} />
              </button>
            </div>
          </div>
          {showCompanies && (
            <div className="item-list scrollable" style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
              {companies.map((c, i) => (
                <span key={i} className="chip">
                  {c.name || c} {c.category && <small>({c.category})</small>}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ITEM MODELS */}
        <section className="setup-card full-row">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <PackageCheck size={20} />
              <h3>ITEM MODELS</h3>
            </div>
            <button 
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}
              onClick={() => setShowModels(!showModels)}
            >
              {showModels ? <><EyeOff size={16}/> Hide</> : <><Eye size={16}/> Show</>}
            </button>
          </div>
          <div className="setup-input-row">
            <SearchableInput
              options={categories}
              value={newModel.category}
              onChange={(val) => setNewModel({ ...newModel, category: val, company: '' })}
              placeholder="Category"
            />

            <SearchableInput
              options={companies.filter(c => c.category === newModel.category).map(c => c.name)}
              value={newModel.company}
              onChange={(val) => setNewModel({ ...newModel, company: val })}
              placeholder="Company"
              disabled={!newModel.category}
            />

            <input 
              type="text" 
              placeholder="Model Name (Ex: iPhone 15 Pro)" 
              value={newModel.name}
              onChange={(e) => setNewModel({...newModel, name: e.target.value})}
            />
            
            <button className="btn primary" onClick={handleAddModel}>
              <Plus size={18} />
              <span>Add Model</span>
            </button>
          </div>
          {showModels && (
            <div className="item-list scrollable" style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
               {models.map((m, i) => (
                <span key={i} className="chip">
                  {m.name || m} {m.company && <small>({m.company} - {m.category})</small>}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MasterData;

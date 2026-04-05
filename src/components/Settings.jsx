import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Tag, Building2, PackageCheck, ShoppingBag, Database } from 'lucide-react';
import './Settings.css';

const Settings = ({
  categories, companies, models, sales,
  onDeleteCategory, onDeleteCompany, onDeleteModel, onDeleteSale, onDeleteAll
}) => {
  const [confirmAction, setConfirmAction] = useState(null); // { type, label, action }
  const [done, setDone] = useState(null);

  const ask = (type, label, action) => setConfirmAction({ type, label, action });

  const confirm = () => {
    if (confirmAction) {
      confirmAction.action();
      setDone(confirmAction.label);
      setConfirmAction(null);
      setTimeout(() => setDone(null), 3000);
    }
  };

  const sections = [
    {
      icon: Tag,
      title: 'Categories',
      color: '#6366f1',
      bg: '#eef2ff',
      items: categories,
      getLabel: (c) => c,
      onDelete: (c) => ask('category', `Delete category "${c}"`, () => onDeleteCategory(c)),
      onDeleteAll: () => ask('all-categories', 'Delete ALL Categories', () => categories.forEach(c => onDeleteCategory(c))),
    },
    {
      icon: Building2,
      title: 'Companies / Brands',
      color: '#0891b2',
      bg: '#ecfeff',
      items: companies,
      getLabel: (c) => `${c.name || c} ${c.category ? `(${c.category})` : ''}`,
      onDelete: (c) => ask('company', `Delete company "${c.name || c}"`, () => onDeleteCompany(c.id || c)),
      onDeleteAll: () => ask('all-companies', 'Delete ALL Companies', () => companies.forEach(c => onDeleteCompany(c.id || c))),
    },
    {
      icon: PackageCheck,
      title: 'Item Models',
      color: '#059669',
      bg: '#ecfdf5',
      items: models,
      getLabel: (m) => `${m.name || m} ${m.company ? `(${m.company})` : ''}`,
      onDelete: (m) => ask('model', `Delete model "${m.name || m}"`, () => onDeleteModel(m.id || m)),
      onDeleteAll: () => ask('all-models', 'Delete ALL Models', () => models.forEach(m => onDeleteModel(m.id || m))),
    },
    {
      icon: ShoppingBag,
      title: 'Sales Records',
      color: '#dc2626',
      bg: '#fef2f2',
      items: sales,
      getLabel: (s) => `Invoice #${s.id} — ${s.customer} — Rs.${(s.total || 0).toFixed(2)}`,
      onDelete: (s) => ask('sale', `Delete sale #${s.id}`, () => onDeleteSale(s.id)),
      onDeleteAll: () => ask('all-sales', 'Delete ALL Sales', () => sales.forEach(s => onDeleteSale(s.id))),
    },
  ];

  return (
    <div className="settings-page fade-in">
      <header className="settings-header">
        <h1>Settings & Data Management</h1>
        <p>Delete individual records or clear entire data sections.</p>
      </header>

      {done && (
        <div className="settings-toast">
          <CheckCircle2 size={18} /> {done} — Done!
        </div>
      )}

      <div className="settings-sections">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div key={sec.title} className="settings-card">
              <div className="settings-card-header" style={{ borderLeftColor: sec.color }}>
                <div className="settings-card-title">
                  <div className="settings-icon" style={{ background: sec.bg, color: sec.color }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3>{sec.title}</h3>
                    <span className="settings-count">{sec.items.length} record{sec.items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <button
                  className="btn-delete-all"
                  onClick={sec.onDeleteAll}
                  disabled={sec.items.length === 0}
                >
                  <Trash2 size={14} /> Delete All
                </button>
              </div>

              <div className="settings-item-list">
                {sec.items.length === 0 ? (
                  <div className="settings-empty">No records found.</div>
                ) : (
                  sec.items.map((item, i) => (
                    <div key={i} className="settings-item">
                      <span className="settings-item-label">{sec.getLabel(item)}</span>
                      <button className="btn-delete-one" onClick={() => sec.onDelete(item)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Delete Everything */}
        <div className="settings-card danger-zone">
          <div className="settings-card-header" style={{ borderLeftColor: '#dc2626' }}>
            <div className="settings-card-title">
              <div className="settings-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <Database size={20} />
              </div>
              <div>
                <h3>Delete Everything</h3>
                <span className="settings-count">Clear all data from the system</span>
              </div>
            </div>
            <button className="btn-delete-all danger" onClick={() => ask('all', 'Delete ALL data from this system', onDeleteAll)}>
              <Trash2 size={14} /> Wipe All Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="settings-confirm-overlay">
          <div className="settings-confirm-box">
            <div className="settings-confirm-icon">
              <AlertTriangle size={32} color="#dc2626" />
            </div>
            <h3>Are you sure?</h3>
            <p>{confirmAction.label}</p>
            <p className="settings-confirm-warning">This action <strong>cannot be undone</strong>.</p>
            <div className="settings-confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={confirm}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

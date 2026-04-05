import React, { useState } from 'react';
import { User, Package, Plus, Trash2, X, Printer, FileText, Lock, Hash, StickyNote, Edit3, Save } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import './SalesPortal.css';

const SalesPortal = ({ products, sales, onAddSale, onDeleteSale, onUpdateSale, persistentSettings, onUpdateSettings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [stockError, setStockError] = useState('');

  const [newSale, setNewSale] = useState({
    customer: '',
    phone: '',
    cnic: '',
    items: [{ productId: '', salePrice: '', quantity: 1 }]
  });

  const addItemRow = () => {
    setNewSale({ ...newSale, items: [...newSale.items, { productId: '', salePrice: '', quantity: 1 }] });
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 0 && val[0] !== '0') val = '0' + val.slice(1);
    if (val.length > 1 && val[1] !== '3') val = '03' + val.slice(2);
    setNewSale({ ...newSale, phone: val });
  };

  const handleCnicChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) val = val.slice(0, 13);
    
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    }
    setNewSale({ ...newSale, cnic: formatted });
  };

  const removeItemRow = (index) => {
    if (newSale.items.length > 1) {
      const updatedItems = newSale.items.filter((_, i) => i !== index);
      setNewSale({ ...newSale, items: updatedItems });
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...newSale.items];
    updatedItems[index][field] = value;
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) updatedItems[index].salePrice = product.sale_price;
    }
    setNewSale({ ...newSale, items: updatedItems });
  };

  const calculateTotal = () => {
    return newSale.items.reduce((sum, item) => sum + ((parseFloat(item.salePrice) || 0) * (parseInt(item.quantity) || 1)), 0).toFixed(2);
  };

  const handleSaleAction = (shouldPrint = false) => {
    setStockError('');
    const validItems = newSale.items.filter(item => item.productId && item.salePrice);
    if (!newSale.customer || validItems.length === 0) return;

    // Stock validation: count how many of each product is being sold
    if (!editingSale) {
      const productCounts = {};
      validItems.forEach(item => {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + (parseInt(item.quantity) || 1);
      });

      for (const [productId, qty] of Object.entries(productCounts)) {
        const prod = products.find(p => p.id === productId);
        if (prod && prod.stock < qty) {
          setStockError(`Not enough stock for "${prod.model}". Available: ${prod.stock}, Requested: ${qty}`);
          return;
        }
      }
    }

    const saleItems = validItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.model : 'Unknown',
        quantity: parseInt(item.quantity) || 1,
        salePrice: parseFloat(item.salePrice)
      };
    });

    const total = validItems.reduce((sum, item) => sum + (parseFloat(item.salePrice) * (parseInt(item.quantity) || 1)), 0);

    const sale = {
      id: editingSale ? editingSale.id : persistentSettings.invoiceNo,
      memo: editingSale ? editingSale.memo : persistentSettings.cashMemo,
      customer: newSale.customer,
      phone: newSale.phone,
      cnic: newSale.cnic,
      items: saleItems,
      total: total,
      date: editingSale ? editingSale.date : new Date().toLocaleString()
    };
    
    if (editingSale) {
      onUpdateSale(sale);
    } else {
      onAddSale(sale);
    }

    setNewSale({ customer: '', phone: '', cnic: '', items: [{ productId: '', salePrice: '', quantity: 1 }] });
    setEditingSale(null);
    setIsModalOpen(false);
    
    if (shouldPrint && !editingSale) {
      setInvoicePreview(sale);
    }
  };

  const startEdit = (sale) => {
    setEditingSale(sale);
    setNewSale({
      customer: sale.customer,
      phone: sale.phone || '',
      cnic: sale.cnic || '',
      items: sale.items.map(item => ({ productId: item.productId, salePrice: item.salePrice, quantity: item.quantity || 1 }))
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (saleId) => {
    setConfirmDeleteId(saleId);
  };

  const handleConfirmDelete = () => {
    onDeleteSale(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  if (isModalOpen) {
    return (
      <div className="sales-portal-input fade-in">
        <header className="sales-header">
           <div className="header-text">
             <h1>{editingSale ? 'Edit Sale' : 'New Sale Entry'}</h1>
             <p>Invoice #{editingSale ? editingSale.id : persistentSettings.invoiceNo}</p>
           </div>
           <button className="btn-icon" onClick={() => { setIsModalOpen(false); setEditingSale(null); }}><X size={24}/></button>
        </header>

        <div className="sale-form-container">
            <div className="sale-form">
              <div className="persistent-settings-inside">
                 <div className="form-group sticky">
                    <label><Hash size={14}/> Invoice No (4-Digit)</label>
                    <input type="text" maxLength="4" disabled={editingSale} value={editingSale ? editingSale.id : persistentSettings.invoiceNo} onChange={e => onUpdateSettings({...persistentSettings, invoiceNo: e.target.value})} />
                 </div>
                 <div className="form-group sticky">
                    <label><StickyNote size={14}/> Cash Memo (4-5 Alpha)</label>
                    <input type="text" maxLength="5" className="alpha-input" disabled={editingSale} value={editingSale ? editingSale.memo : persistentSettings.cashMemo} onChange={e => onUpdateSettings({...persistentSettings, cashMemo: e.target.value.toUpperCase()})} />
                 </div>
              </div>

              <section className="form-section">
                <h3><User size={18}/> CUSTOMER INFORMATION</h3>
                <div className="input-grid">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input type="text" placeholder="Jan Ali" value={newSale.customer} onChange={e => setNewSale({...newSale, customer: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" placeholder="03XXXXXXXXX" value={newSale.phone} onChange={handlePhoneChange} />
                  </div>
                  <div className="form-group">
                    <label>CNIC</label>
                    <input type="text" placeholder="XXXXX-XXXXXXX-X" value={newSale.cnic} onChange={handleCnicChange} />
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="section-header">
                  <h3><Package size={18}/> ITEMS SOLD</h3>
                  <button className="btn-link sm" onClick={addItemRow}>+ Add Another Item</button>
                </div>
                <div className="items-list-form">
                  {newSale.items.map((item, idx) => (
                    <div key={idx} className="item-row fade-in">
                      <div className="form-group flex-2">
                        <input 
                          list={`products-list-${idx}`}
                          value={item._productSearch !== undefined ? item._productSearch : (item.productId ? (products.find(p=>p.id===item.productId) ? `${products.find(p=>p.id===item.productId).model} (${products.find(p=>p.id===item.productId).company})` : '') : '')}
                          disabled={editingSale} 
                          placeholder="Type to search item..."
                          onChange={e => {
                            const val = e.target.value;
                            updateItem(idx, '_productSearch', val);
                            const matched = products.find(p => `${p.model} (${p.company})` === val);
                            if (matched) {
                               updateItem(idx, 'productId', matched.id);
                            } else {
                               updateItem(idx, 'productId', '');
                               updateItem(idx, 'salePrice', '');
                            }
                          }}
                          className="searchable-dropdown"
                        />
                        <datalist id={`products-list-${idx}`}>
                          {products.map(p => (
                            <option key={p.id} value={`${p.model} (${p.company})`} disabled={p.stock <= 0 && !editingSale} />
                          ))}
                        </datalist>
                      </div>
                      <div className="form-group" style={{flex: '0 0 70px'}}>
                        <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                      </div>
                      <div className="form-group flex-1">
                        <input type="number" placeholder="Price" value={item.salePrice} onChange={e => updateItem(idx, 'salePrice', e.target.value)} />
                      </div>
                      <button className="remove-btn" disabled={editingSale} onClick={() => removeItemRow(idx)}><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
                <div className="total-bar">
                   <span>Grand Total:</span>
                   <strong>Rs.{calculateTotal()}</strong>
                </div>
              </section>
            </div>

            {stockError && (
              <div style={{ margin: '0 1.5rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ {stockError}
              </div>
            )}

            <div className="modal-footer embedded">
               <button className="btn secondary outline" onClick={() => { setIsModalOpen(false); setEditingSale(null); }}>CANCEL</button>
               <button className="btn save-only" onClick={() => handleSaleAction(false)}>
                  <Save size={18}/> SAVE
               </button>
               <button className="btn primary" onClick={() => handleSaleAction(true)}>
                  <Printer size={18}/> {editingSale ? 'UPDATE & PRINT' : 'SAVE & PRINT'}
               </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-portal fade-in">
      <header className="sales-header">
        <div className="header-text">
          <h1>Customer Sales Records</h1>
          <p>Managed Transactions: {sales.length}</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>NEW SALE</span>
        </button>
      </header>

      {invoicePreview && (
        <div className="modal-overlay">
          <div className="invoice-box fade-in">
             <div className="invoice-header-strip">
                <h2>Invoice <span>#{invoicePreview.id}</span></h2>
                <div className="memo-badge">Memo: {invoicePreview.memo}</div>
                <button className="close-btn" onClick={() => setInvoicePreview(null)}><X size={20}/></button>
             </div>
             <div className="invoice-content">
                <div className="shop-details">
                   <h1>CHOUDHARY ELECTRONICS</h1>
                   <p>Garha Mor</p>
                </div>
                <div className="invoice-meta">
                   <div className="meta-block">
                      <strong>Bill To:</strong>
                      <p>{invoicePreview.customer}</p>
                      <p>Phone: {invoicePreview.phone}</p>
                   </div>
                   <div className="meta-block text-right">
                      <strong>Date:</strong>
                      <p>{invoicePreview.date}</p>
                   </div>
                </div>
                <table className="invoice-table">
                   <thead>
                      <tr>
                         <th>Description</th>
                         <th className="text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody>
                      {invoicePreview.items.map((item, i) => (
                         <tr key={i}>
                            <td>{item.productName}</td>
                            <td className="text-right">Rs.{item.salePrice.toFixed(2)}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
                <div className="invoice-total">
                   <span>Grand Total:</span>
                   <strong>Rs.{invoicePreview.total.toFixed(2)}</strong>
                </div>
             </div>
             <div className="invoice-footer">
                <button className="btn primary" onClick={() => window.print()}>
                   <Printer size={18}/> Print Receipt
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="content-card sales-table-card">
        <div className="table-responsive">
          <table className="sales-table stackable-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Memo</th>
                <th>Customer</th>
                <th>Units</th>
                <th>Total Bill</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, idx) => (
                <tr key={idx}>
                  <td data-label="Invoice #" className="id-cell full-width">#{s.id}</td>
                  <td data-label="Memo">{s.memo}</td>
                  <td data-label="Customer"><strong>{s.customer}</strong></td>
                  <td data-label="Units">{s.items.reduce((sum, i) => sum + (i.quantity || 1), 0)}</td>
                  <td data-label="Total Bill" className="price-cell">Rs.{s.total.toFixed(2)}</td>
                  <td data-label="Actions">
                    <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                       <button className="btn-icon view" onClick={() => setInvoicePreview(s)} title="View Invoice">
                          <FileText size={16}/>
                       </button>
                       <button className="btn-icon edit" onClick={() => startEdit(s)} title="Edit Sale">
                          <Edit3 size={16}/>
                       </button>
                       <button className="btn-icon delete" onClick={() => confirmDelete(s.id)} title="Delete Sale">
                          <Trash2 size={16}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? Stock will be restored."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default SalesPortal;

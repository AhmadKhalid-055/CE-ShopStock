import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Filter, Download, X, Edit, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import './Inventory.css';

const Inventory = ({ products, categories, companies, models, onAddProduct, onDeleteProduct, onUpdateProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    category: '',
    company: '',
    model: '',
    purchase_price: '',
    sale_price: '',
    stock: ''
  });

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setNewProduct({ category: '', company: '', model: '', purchase_price: '', sale_price: '', stock: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setNewProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (newProduct.model && newProduct.purchase_price && newProduct.sale_price && newProduct.stock) {
      const payload = {
        ...newProduct,
        name: `${newProduct.company} ${newProduct.model}`,
        purchase_price: parseFloat(newProduct.purchase_price),
        sale_price: parseFloat(newProduct.sale_price),
        stock: parseInt(newProduct.stock),
        status: parseInt(newProduct.stock) > 0 ? 'In Stock' : 'Out of Stock'
      };

      if (editingProductId) {
        onUpdateProduct(payload);
      } else {
         onAddProduct(payload);
      }
      
      setNewProduct({ category: '', company: '', model: '', purchase_price: '', sale_price: '', stock: '' });
      setEditingProductId(null);
      setIsModalOpen(true); // Ensure smooth transition
      setTimeout(() => setIsModalOpen(false), 50);
    }
  };

  return (
    <div className="inventory fade-in">
      <header className="inventory-header">
        <div className="header-text">
          <h1>Stock Inventory</h1>
          <p>Total items tracking: {products.length}</p>
        </div>
        <div className="header-actions">
          <button className="btn primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </header>

      {/* Cascading Dropdown Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="stock-modal fade-in">
            <div className="modal-header">
              <h2>{editingProductId ? 'Edit Product' : 'Add Product to Stock'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value, company: '', model: ''})}
                >
                  <option value="">Select Category</option>
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Company / Brand</label>
                <select 
                  value={newProduct.company}
                  disabled={!newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, company: e.target.value, model: ''})}
                >
                  <option value="">Select Company</option>
                  {companies
                    .filter(c => c.category === newProduct.category)
                    .map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Model</label>
                <select 
                  value={newProduct.model}
                  disabled={!newProduct.company}
                  onChange={(e) => setNewProduct({...newProduct, model: e.target.value})}
                >
                  <option value="">Select Model</option>
                  {models
                    .filter(m => m.company === newProduct.company && m.category === newProduct.category)
                    .map((m, i) => <option key={i} value={m.name}>{m.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Purchase Price (Rs.)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={newProduct.purchase_price}
                  onChange={(e) => setNewProduct({...newProduct, purchase_price: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Sale Price (Rs.)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={newProduct.sale_price}
                  onChange={(e) => setNewProduct({...newProduct, sale_price: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Opening Amount (Stock)</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-footer">
               <button className="btn secondary outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
               <button className="btn primary" onClick={handleSave}>{editingProductId ? 'Save Changes' : 'Add to Inventory'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="inventory-controls">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by product name, model, or company..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-card inventory-table-card">
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Company</th>
                <th>Purchase</th>
                <th>Sale</th>
                <th>Profit</th>
                <th>In Stock</th>
                <th>Health</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-info-cell">
                      <div className="product-icon">💻</div>
                      <div>
                        <strong>{product.model}</strong>
                      </div>
                    </div>
                  </td>
                  <td><span className="category-tag">{product.category}</span></td>
                  <td>{product.company}</td>
                  <td>Rs.{product.purchase_price.toFixed(2)}</td>
                  <td>Rs.{product.sale_price.toFixed(2)}</td>
                  <td style={{color: 'var(--secondary)', fontWeight: 600}}>
                    +Rs.{(product.sale_price - product.purchase_price).toFixed(2)}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`health-badge ${product.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(product)} title="Edit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(product.id)} title="Delete" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <div className="empty-state">No products found. Add some to get started!</div>}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={() => { onDeleteProduct(confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Inventory;

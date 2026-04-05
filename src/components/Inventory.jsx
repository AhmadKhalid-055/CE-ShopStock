import React, { useState } from 'react';
import { Search, Plus, X, Edit, Trash2, ArrowDownAZ, ArrowUpAZ, ArrowDownUp, Filter } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import SearchableInput from './SearchableInput';
import './Inventory.css';

const Inventory = ({ products, categories, companies, models, onAddProduct, onDeleteProduct, onUpdateProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'az' | 'za' | 'date-asc' | 'date-desc'
  const [isSortOpen, setIsSortOpen] = useState(false);
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

  const filteredProducts = (() => {
    let list = products.filter(p =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.company || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortOrder === 'az') list = [...list].sort((a, b) => (a.model || '').localeCompare(b.model || ''));
    if (sortOrder === 'za') list = [...list].sort((a, b) => (b.model || '').localeCompare(a.model || ''));
    if (sortOrder === 'date-asc') list = [...list].sort((a, b) => (a.id || 0) - (b.id || 0));
    if (sortOrder === 'date-desc') list = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
    if (sortOrder === 'stock-asc') list = [...list].sort((a, b) => (a.stock || 0) - (b.stock || 0));
    if (sortOrder === 'stock-desc') list = [...list].sort((a, b) => (b.stock || 0) - (a.stock || 0));
    return list;
  })();

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
                <SearchableInput
                  options={[...categories].sort((a,b) => a.localeCompare(b))}
                  value={newProduct.category}
                  onChange={(val) => setNewProduct({...newProduct, category: val, company: '', model: ''})}
                  placeholder="Select or type Category"
                />
              </div>

              <div className="form-group">
                <label>Company / Brand</label>
                <SearchableInput
                  options={companies.filter(c => c.category === newProduct.category).map(c => c.name).sort((a,b) => a.localeCompare(b))}
                  value={newProduct.company}
                  disabled={!newProduct.category}
                  onChange={(val) => setNewProduct({...newProduct, company: val, model: ''})}
                  placeholder="Select or type Company"
                />
              </div>

              <div className="form-group">
                <label>Model</label>
                <SearchableInput
                  options={models.filter(m => m.company === newProduct.company && m.category === newProduct.category).map(m => m.name).sort((a,b) => a.localeCompare(b))}
                  value={newProduct.model}
                  disabled={!newProduct.company}
                  onChange={(val) => setNewProduct({...newProduct, model: val})}
                  placeholder="Select or type Model"
                />
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
        <div className="filter-dropdown-container" style={{ position: 'relative' }}>
          <button className="btn outline" onClick={() => setIsSortOpen(!isSortOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', color: '#334155', fontWeight: 600 }}>
            <Filter size={18} />
            <span>Sort By</span>
          </button>
          
          {isSortOpen && (
            <div className="filter-dropdown-menu fade-in" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', zIndex: 50, minWidth: '200px', display: 'flex', flexDirection: 'column', padding: '0.5rem', gap: '0.25rem' }}>
              <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: sortOrder === 'az' ? '#f0f9ff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: sortOrder === 'az' ? 'var(--primary)' : '#475569', fontWeight: 500 }} onClick={() => { setSortOrder(sortOrder === 'az' ? 'default' : 'az'); setIsSortOpen(false); }}>
                <ArrowDownAZ size={16} /> A to Z
              </button>
              <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: sortOrder === 'za' ? '#f0f9ff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: sortOrder === 'za' ? 'var(--primary)' : '#475569', fontWeight: 500 }} onClick={() => { setSortOrder(sortOrder === 'za' ? 'default' : 'za'); setIsSortOpen(false); }}>
                <ArrowUpAZ size={16} /> Z to A
              </button>
              <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: sortOrder === 'date-desc' ? '#f0f9ff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: sortOrder === 'date-desc' ? 'var(--primary)' : '#475569', fontWeight: 500 }} onClick={() => { setSortOrder(sortOrder === 'date-desc' ? 'default' : 'date-desc'); setIsSortOpen(false); }}>
                <ArrowDownUp size={16} /> Newest First
              </button>
              <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: sortOrder === 'date-asc' ? '#f0f9ff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: sortOrder === 'date-asc' ? 'var(--primary)' : '#475569', fontWeight: 500 }} onClick={() => { setSortOrder(sortOrder === 'date-asc' ? 'default' : 'date-asc'); setIsSortOpen(false); }}>
                <ArrowDownUp size={16} /> Oldest First
              </button>
              <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: sortOrder === 'stock-desc' ? '#f0f9ff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: sortOrder === 'stock-desc' ? 'var(--primary)' : '#475569', fontWeight: 500 }} onClick={() => { setSortOrder(sortOrder === 'stock-desc' ? 'default' : 'stock-desc'); setIsSortOpen(false); }}>
                <ArrowDownUp size={16} /> Stock: High to Low
              </button>
              <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: sortOrder === 'stock-asc' ? '#f0f9ff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: sortOrder === 'stock-asc' ? 'var(--primary)' : '#475569', fontWeight: 500 }} onClick={() => { setSortOrder(sortOrder === 'stock-asc' ? 'default' : 'stock-asc'); setIsSortOpen(false); }}>
                <ArrowDownUp size={16} /> Stock: Low to High
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="content-card inventory-table-card">
        <div className="table-responsive">
          <table className="inventory-table stackable-table">
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
                  <td data-label="Product Info" className="full-width">
                    <div className="product-info-cell">
                      <div className="product-icon">💻</div>
                      <div>
                        <strong>{product.model}</strong>
                      </div>
                    </div>
                  </td>
                  <td data-label="Category"><span className="category-tag">{product.category}</span></td>
                  <td data-label="Company">{product.company}</td>
                  <td data-label="Purchase">Rs.{product.purchase_price.toFixed(2)}</td>
                  <td data-label="Sale">Rs.{product.sale_price.toFixed(2)}</td>
                  <td data-label="Profit" style={{color: 'var(--secondary)', fontWeight: 600}}>
                    +Rs.{(product.sale_price - product.purchase_price).toFixed(2)}
                  </td>
                  <td data-label="In Stock">{product.stock}</td>
                  <td data-label="Health">
                    <span className={`health-badge ${product.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {product.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(product)} title="Edit" className="mobile-action-btn edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(product.id)} title="Delete" className="mobile-action-btn delete">
                        <Trash2 size={18} />
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

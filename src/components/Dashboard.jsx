import React from 'react';
import { TrendingUp, Users, Package, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
  <div className="stat-card fade-in">
    <div className="stat-card-header">
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={24} />
      </div>
      <div className={`stat-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : ''}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </div>
    </div>
    <div className="stat-card-body">
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

const Dashboard = ({ products, sales }) => {
  // Calculate real stats from inventory data
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalCustomers = new Set(sales.map(s => s.customer)).size;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockItems = products.filter(p => p.stock <= 5);
  const totalProducts = products.length;

  // Calculate total inventory value (purchase cost)
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.purchase_price || 0) * (p.stock || 0)), 0);

  const stats = [
    { title: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString('en-PK', {minimumFractionDigits: 2})}`, icon: TrendingUp, color: '#6366f1', trend: sales.length > 0 ? 12.5 : 0 },
    { title: 'Customers', value: `${totalCustomers}`, icon: Users, color: '#10b981', trend: totalCustomers > 0 ? 4.2 : 0 },
    { title: 'Total Stock', value: `${totalStock} Units`, icon: Package, color: '#f59e0b', trend: totalStock > 0 ? 0 : -100 },
    { title: 'Low Stock Alerts', value: `${lowStockItems.length} Items`, icon: AlertCircle, color: '#ef4444', trend: 0 },
  ];

  // Recent sales (last 5)
  const recentSales = sales.slice(0, 5).map(s => ({
    id: s.id,
    item: s.items.map(i => i.productName).join(', '),
    customer: s.customer,
    amount: `Rs.${(s.total || 0).toFixed(2)}`,
    status: 'Completed',
    date: s.date || 'N/A'
  }));

  // Category breakdown from products
  const categoryMap = {};
  products.forEach(p => {
    if (p.category) {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    }
  });
  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const categoryTotal = categoryEntries.reduce((sum, [, count]) => sum + count, 0);
  const categoryColors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Choudhary Electronics Overview</h1>
          <p>Welcome back! Here's the current health of your shop inventory.</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="dashboard-content">
        <div className="content-card sales-table fade-in">
          <div className="card-header">
            <h3>Recent Transactions</h3>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length > 0 ? recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <div className="item-info">
                        <strong>{sale.item}</strong>
                      </div>
                    </td>
                    <td>{sale.customer}</td>
                    <td>{sale.amount}</td>
                    <td>
                      <span className={`status-badge ${sale.status.toLowerCase()}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td>{sale.date}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{textAlign:'center', color:'#94a3b8', padding:'2rem'}}>No sales yet. Start selling!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-card inventory-summary fade-in">
           <div className="card-header">
            <h3>Top Categories</h3>
          </div>
          <div className="pie-chart-mock">
            {categoryEntries.length > 0 ? categoryEntries.map(([cat, count], idx) => {
              const pct = categoryTotal > 0 ? Math.round((count / categoryTotal) * 100) : 0;
              return (
                <div className="category-item" key={cat}>
                  <span className="dot" style={{background: categoryColors[idx % categoryColors.length]}}></span>
                  <span>{cat}</span>
                  <span className="percent">{pct}%</span>
                </div>
              );
            }) : (
              <p style={{color:'#94a3b8', textAlign:'center'}}>No products added yet.</p>
            )}
            {categoryEntries.length > 0 && (
              <div className="simple-bar-wrap">
                {categoryEntries.map(([cat, count], idx) => {
                  const pct = categoryTotal > 0 ? Math.round((count / categoryTotal) * 100) : 0;
                  return (
                    <div key={cat} className="simple-bar" style={{width: `${pct}%`, background: categoryColors[idx % categoryColors.length]}}></div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

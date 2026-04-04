import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import './Analytics.css';

const Analytics = ({ sales, products }) => {
  const [timeframe, setTimeframe] = useState('monthly');

  // Helper to parse the local date string back to Date object
  const parseDate = (dateStr) => {
    try {
      return new Date(dateStr);
    } catch (e) {
      return new Date();
    }
  };

  const calculateStats = (filteredSales) => {
    let revenue = 0;
    let profit = 0;
    let unitsRaw = 0;

    filteredSales.forEach(sale => {
      revenue += sale.total;
      unitsRaw += sale.items.length;
      
      sale.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          profit += (item.salePrice - prod.purchase_price);
        }
      });
    });

    return { revenue, profit, units: unitsRaw };
  };

  const now = new Date();
  
  // Filter Logic
  const getFilteredData = () => {
    return sales.filter(sale => {
      const saleDate = parseDate(sale.date);
      if (timeframe === 'daily') {
        return saleDate.toDateString() === now.toDateString();
      }
      if (timeframe === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return saleDate >= weekAgo;
      }
      if (timeframe === 'monthly') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      if (timeframe === 'yearly') {
        return saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const currentSales = getFilteredData();
  const stats = calculateStats(currentSales);

  return (
    <div className="analytics fade-in">
      <header className="analytics-header">
        <div className="header-text">
          <h1>Shop Analytics</h1>
          <p>Detailed performance insights for Choudhary Electronics.</p>
        </div>
        <div className="timeframe-picker">
          {['daily', 'weekly', 'monthly', 'yearly'].map(t => (
            <button 
              key={t} 
              className={`time-btn ${timeframe === t ? 'active' : ''}`}
              onClick={() => setTimeframe(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card modern">
          <div className="card-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="card-info">
            <p>Total Revenue</p>
            <h3>Rs.{stats.revenue.toLocaleString()}</h3>
            <span className="trend positive"><ArrowUpRight size={14}/> +12.5% vs last {timeframe}</span>
          </div>
        </div>

        <div className="stat-card modern">
          <div className="card-icon profit">
            <TrendingUp size={24} />
          </div>
          <div className="card-info">
            <p>Net Profit</p>
            <h3 style={{color: '#10b981'}}>Rs.{stats.profit.toLocaleString()}</h3>
            <span className="trend positive"><ArrowUpRight size={14}/> +8.3%</span>
          </div>
        </div>

        <div className="stat-card modern">
          <div className="card-icon units">
            <Package size={24} />
          </div>
          <div className="card-info">
            <p>Items Sold</p>
            <h3>{stats.units} Units</h3>
            <span className="trend positive"><ArrowUpRight size={14}/> {currentSales.length} Invoices</span>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="content-card sales-chart-card">
          <div className="card-header">
            <div className="header-group">
               <Calendar size={20}/>
               <h3>Performance Overview ({timeframe})</h3>
            </div>
          </div>
          <div className="mock-chart-container">
             <div className="chart-label">Growth Visualized</div>
             <div className="simple-bar-chart">
                <div className="bar-column">
                   <div className="bar" style={{height: '40%'}}></div>
                   <span>Mon</span>
                </div>
                <div className="bar-column">
                   <div className="bar" style={{height: '65%'}}></div>
                   <span>Tue</span>
                </div>
                <div className="bar-column">
                   <div className="bar" style={{height: '85%', background: '#6366f1'}}></div>
                   <span>Wed</span>
                </div>
                <div className="bar-column">
                   <div className="bar" style={{height: '50%'}}></div>
                   <span>Thu</span>
                </div>
                <div className="bar-column">
                   <div className="bar" style={{height: '95%', background: '#10b981'}}></div>
                   <span>Fri</span>
                </div>
                <div className="bar-column">
                   <div className="bar" style={{height: '75%'}}></div>
                   <span>Sat</span>
                </div>
                <div className="bar-column">
                   <div className="bar" style={{height: '30%'}}></div>
                   <span>Sun</span>
                </div>
             </div>
          </div>
        </div>

        <div className="content-card top-products-card">
          <div className="card-header">
             <h3>Best Sellers</h3>
          </div>
          <div className="mini-product-list">
             {products.slice(0, 4).map((p, i) => (
                <div key={i} className="mini-product-item">
                   <div className="p-icon">📱</div>
                   <div className="p-details">
                      <strong>{p.model}</strong>
                      <small>{p.company}</small>
                   </div>
                   <div className="p-stat">
                      <strong>+Rs.{(p.sale_price - p.purchase_price).toFixed(0)} </strong>
                      <span>Profit/unit</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

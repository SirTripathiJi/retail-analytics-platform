/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Package,
  PackageX,
  Receipt,
  TrendingUp,
  XCircle,
} from 'lucide-react';

import { StatCard } from '../components/UI/StatCard';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { isExpired, isExpiringSoon, toDateLabel } from '../lib/dates';

export function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t = (k) => k, lang } = useTranslation();
  const { sales: salesData, products: productsData } = useData();

  const [cardOrder, setCardOrder] = useState(['sales', 'profit', 'products', 'txns']);
  const [draggedId, setDraggedId] = useState(null);

  // ----------- DERIVED METRICS -----------
  const totalSales = useMemo(
    () => salesData.reduce((a, x) => a + (Number(x.total || x.amt) || 0), 0),
    [salesData]
  );
  const totalProfit = useMemo(
    () => salesData.reduce((a, x) => a + (Number(x.profit) || 0), 0),
    [salesData]
  );
  const totalProducts = productsData.length;
  const totalTxns = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return salesData.filter((x) => x.date && new Date(x.date).toLocaleDateString() === today)
      .length;
  }, [salesData]);

  // ----------- STAT CARDS -----------
  const cardsData = {
    sales: {
      id: 'sales',
      label: t('dashboard.totalSales'),
      icon: <Receipt className="w-5 h-5" />,
      value: `₹${totalSales.toLocaleString()}`,
      bgAccent: '#FFD600',
    },
    profit: {
      id: 'profit',
      label: t('dashboard.netProfit'),
      icon: <TrendingUp className="w-5 h-5" />,
      value: `₹${totalProfit.toLocaleString()}`,
      bgAccent: '#00C853',
    },
    products: {
      id: 'products',
      label: t('dashboard.productsInStock'),
      icon: <Package className="w-5 h-5" />,
      value: totalProducts,
      bgAccent: '#00E5FF',
    },
    txns: {
      id: 'txns',
      label: t('dashboard.transactionsToday'),
      icon: Activity ? <Activity className="w-5 h-5" /> : null,
      value: totalTxns,
      bgAccent: '#FF4081',
    },
  };

  const handleDragStart = (id) => setDraggedId(id);
  const handleDragEnter = (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    setCardOrder((prev) => {
      const o = [...prev];
      const si = o.indexOf(draggedId),
        di = o.indexOf(targetId);
      [o[si], o[di]] = [o[di], o[si]];
      return o;
    });
  };

  // ----------- SMART INVENTORY ALERT SYSTEM -----------
  const inventoryAlerts = useMemo(() => {
    const alerts = [];
    productsData.forEach((p) => {
      const expired = isExpired(p.expiry_date);
      const expiring = isExpiringSoon(p.expiry_date, 7);
      const lowStock =
        Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.low_stock_threshold || 5);
      const oos = Number(p.quantity) === 0;

      if (expired) {
        alerts.push({
          ...p,
          type: 'EXPIRED',
          priority: 1,
          label: t('inventory.expired', 'Expired'),
          color: 'var(--color-error)',
          bgColor: isDark ? 'rgba(232,69,69,0.12)' : '#FFEBEE',
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        });
      } else if (expiring) {
        alerts.push({
          ...p,
          type: 'NEAR_EXPIRY',
          priority: 2,
          label: t('inventory.expiringSoon', 'Near Expiry'),
          color: '#FFD600',
          bgColor: isDark ? 'rgba(255,214,0,0.10)' : '#FFFDE7',
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
        });
      } else if (lowStock) {
        alerts.push({
          ...p,
          type: 'LOW_STOCK',
          priority: 3,
          label: t('inventory.lowStockBadge', 'Low Stock'),
          color: 'var(--color-brand)',
          bgColor: isDark ? 'rgba(255,214,0,0.08)' : '#FFF8E1',
          icon: <AlertOctagon className="w-5 h-5 text-amber-500" />,
        });
      } else if (oos) {
        alerts.push({
          ...p,
          type: 'OUT_OF_STOCK',
          priority: 4,
          label: t('inventory.outOfStock', 'Out of Stock'),
          color: '#757575',
          bgColor: isDark ? 'rgba(120,120,130,0.10)' : '#F5F5F5',
          icon: <XCircle className="w-5 h-5 text-gray-400" />,
        });
      }
    });

    return alerts.sort((a, b) => a.priority - b.priority);
  }, [productsData, t, lang]);

  return (
    <div className="space-y-12">
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cardOrder.map((id) => {
          const c = cardsData[id];
          return (
            <StatCard
              key={c.id}
              id={c.id}
              label={c.label}
              icon={c.icon}
              value={c.value}
              bgAccent={c.bgAccent}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={() => setDraggedId(null)}
            />
          );
        })}
      </div>

      {/* INVENTORY ALERTS (ACTION REQUIRED) */}
      <div className="brutalist-card hover:shadow-[8px_8px_0_var(--shadow-color)] transition-shadow min-h-[400px]">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-[var(--border-color)]">
          <div className="w-10 h-10 border-2 border-[var(--border-color)] bg-[#FF4081] flex items-center justify-center shadow-[2px_2px_0_var(--shadow-color)] text-white">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest">
            {t('dashboard.inventoryAlerts', 'Inventory Alerts (Action Required)')}
          </h2>
        </div>

        {inventoryAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {inventoryAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0_var(--shadow-color)] flex flex-col justify-between"
                style={{ backgroundColor: alert.bgColor }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 border-2 border-[var(--border-color)] bg-[var(--card-bg)]">
                      {alert.icon}
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-sm tracking-tight text-[var(--text-primary)]">
                        {alert.name}
                      </h3>
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                        {alert.category || t('inventory.generalCategory', 'General')}
                      </p>
                    </div>
                  </div>
                  <span
                    className="badge font-black text-[9px] uppercase tracking-widest border-2"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: alert.color,
                      color:
                        alert.type === 'NEAR_EXPIRY' || alert.type === 'LOW_STOCK'
                          ? '#111111'
                          : '#FFFFFF',
                    }}
                  >
                    {alert.label}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold border-b border-[var(--border-color)] pb-1">
                    <span className="text-[var(--text-secondary)] uppercase tracking-tighter">
                      {t('dashboard.currentQuantity', 'Current Quantity')}
                    </span>
                    <span className="font-black text-sm text-[var(--text-primary)]">{alert.quantity}</span>
                  </div>
                  {alert.expiry_date && (
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[var(--text-secondary)] uppercase tracking-tighter">
                        {t('dashboard.expiryDate', 'Expiry Date')}
                      </span>
                      <span
                        className={`font-black ${alert.type === 'EXPIRED' ? 'text-red-500' : 'text-[var(--text-primary)]'}`}
                      >
                        {toDateLabel(alert.expiry_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-20 opacity-30">
            <Package className="w-20 h-20" />
            <div className="text-center">
              <p className="text-xl font-black uppercase tracking-[0.2em]">
                {t('dashboard.allClear', 'All Clear!')}
              </p>
              <p className="text-sm font-bold mt-2">
                {t('dashboard.noActionRequired', 'No inventory actions required at this time.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

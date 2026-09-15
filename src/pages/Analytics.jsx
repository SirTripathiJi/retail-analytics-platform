import React, { Component, useMemo, useState } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error(error);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-10 text-center font-bold text-[var(--text-primary)]">
            Something went wrong rendering this component.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LineChart as LineChartIcon,
  Package,
  PieChart,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';

import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  ChartDataLabels
);

export function Analytics() {
  const { theme } = useTheme();
  const { t = (k) => k, lang } = useTranslation();
  const { sales: salesData, products: productsData } = useData();

  const [timeRange, setTimeRange] = useState('daily');
  const [donutToggle, setDonutToggle] = useState('revenue');
  const [sortConfig, setSortConfig] = useState({ key: 'revenue', direction: 'desc' });

  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#111111';
  const axisTextColor = isDark ? '#aaaaaa' : '#555555';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // --- SALES TREND ANALYSIS (Line + Area) ---
  const lineData = useMemo(() => {
    const dmapRev = {};
    const dmapProf = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysToTrack = 14;
    if (timeRange === 'weekly') daysToTrack = 30; // approx 4 weeks
    if (timeRange === 'monthly') daysToTrack = 180; // approx 6 months

    // Initialize buckets
    for (let i = daysToTrack; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      let lbl = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      if (timeRange === 'weekly') {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        lbl = `Wk of ${startOfWeek.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
      } else if (timeRange === 'monthly') {
        lbl = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      }
      dmapRev[lbl] = 0;
      dmapProf[lbl] = 0;
    }

    salesData.forEach((x) => {
      const d = new Date(x.date);
      let lbl = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      if (timeRange === 'weekly') {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        lbl = `Wk of ${startOfWeek.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
      } else if (timeRange === 'monthly') {
        lbl = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      }
      if (dmapRev[lbl] !== undefined) {
        dmapRev[lbl] += x.total || x.amt || 0;
        dmapProf[lbl] += x.profit || 0;
      }
    });

    return {
      labels: Object.keys(dmapRev),
      datasets: [
        {
          label: 'Revenue',
          data: Object.values(dmapRev),
          borderColor: '#FFD600',
          backgroundColor: 'rgba(255, 214, 0, 0.1)',
          borderWidth: 4,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: isDark ? '#151515' : '#ffffff',
          pointBorderColor: '#FFD600',
          pointBorderWidth: 2,
        },
        {
          label: 'Profit',
          data: Object.values(dmapProf),
          borderColor: '#00E5FF',
          backgroundColor: 'transparent',
          borderWidth: 4,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: isDark ? '#151515' : '#ffffff',
          pointBorderColor: '#00E5FF',
          pointBorderWidth: 2,
        },
      ],
    };
  }, [salesData, timeRange, isDark]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { family: 'Space Grotesk', size: 14, weight: '700' },
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        padding: 12,
        cornerRadius: 0,
        displayColors: false,
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        ticks: { color: axisTextColor, font: { family: 'Space Grotesk', size: 12, weight: '700' } },
        grid: { display: false },
        border: { color: textColor, width: 2 },
      },
      y: {
        ticks: { color: axisTextColor, font: { family: 'Space Grotesk', size: 12, weight: '700' } },
        grid: { color: gridColor },
        border: { color: textColor, width: 2 },
      },
    },
  };

  // --- PROFIT COMPOSITION (Stacked Bar) ---
  const stackedBarData = useMemo(() => {
    const dmap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const lbl = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      dmap[lbl] = { rev: 0, cost: 0, profit: 0 };
    }
    salesData.forEach((x) => {
      const lbl = new Date(x.date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      });
      if (dmap[lbl]) {
        const rev = x.total || x.amt || 0;
        const prof = x.profit || 0;
        dmap[lbl].rev += rev;
        dmap[lbl].profit += prof;
        dmap[lbl].cost += rev - prof;
      }
    });

    const labels = Object.keys(dmap);
    return {
      labels,
      datasets: [
        {
          label: 'Profit',
          data: labels.map((l) => dmap[l].profit),
          backgroundColor: '#00C853',
          borderColor: isDark ? '#ffffff' : '#000000',
          borderWidth: 2,
        },
        {
          label: 'Cost',
          data: labels.map((l) => dmap[l].cost),
          backgroundColor: '#FF4081',
          borderColor: isDark ? '#ffffff' : '#000000',
          borderWidth: 2,
        },
      ],
    };
  }, [salesData, isDark]);

  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { family: 'Space Grotesk', size: 14, weight: '700' },
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        padding: 12,
        cornerRadius: 0,
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: axisTextColor, font: { family: 'Space Grotesk', size: 12, weight: '700' } },
        grid: { display: false },
        border: { color: textColor, width: 2 },
      },
      y: {
        stacked: true,
        ticks: { color: axisTextColor, font: { family: 'Space Grotesk', size: 12, weight: '700' } },
        grid: { color: gridColor },
        border: { color: textColor, width: 2 },
      },
    },
  };

  // --- CATEGORY DONUT ---
  const donutData = useMemo(() => {
    const cmap = {};
    salesData.forEach((txn) => {
      const items = txn.items || [txn];
      items.forEach((item) => {
        const prod = productsData.find((x) => String(x.id) === String(item.pid || item.id));
        const cat = prod ? prod.category : 'General';
        const val =
          donutToggle === 'revenue'
            ? (item.qty || 0) * (item.rate || item.sell || 0) || txn.amt
            : item.qty || 1;
        cmap[cat] = (cmap[cat] || 0) + val;
      });
    });
    return {
      labels: Object.keys(cmap),
      datasets: [
        {
          data: Object.values(cmap),
          backgroundColor: [
            '#FFD600',
            '#FF4081',
            '#00E5FF',
            '#00C853',
            isDark ? '#333333' : '#111111',
            '#FF9100',
          ],
          borderColor: isDark ? '#ffffff' : '#000000',
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };
  }, [salesData, productsData, donutToggle, isDark]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Space Grotesk', size: 12, weight: '700' },
          padding: 24,
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        padding: 12,
        cornerRadius: 0,
      },
      datalabels: {
        color: '#ffffff',
        font: { family: 'Space Grotesk', weight: '900', size: 14 },
        formatter: (value, ctx) => {
          let sum = 0;
          let dataArr = ctx.chart.data.datasets[0].data;
          dataArr.map((data) => {
            sum += data;
          });
          if (sum === 0) return '';
          let percentage = ((value * 100) / sum).toFixed(0) + '%';
          return percentage;
        },
        textStrokeColor: '#000000',
        textStrokeWidth: 4,
      },
    },
  };

  // --- PRODUCT PERFORMANCE GRID ---
  const productGridData = useMemo(() => {
    if (!salesData || !Array.isArray(salesData)) return [];

    const pmap = {};
    salesData.forEach((txn) => {
      const items = txn.items || [txn];
      items.forEach((item) => {
        const id = String(item.pid || item.id);
        if (!pmap[id])
          pmap[id] = {
            id,
            product: item.name || 'Unknown',
            units: 0,
            revenue: 0,
            profit: 0,
            margin: 0,
          };
        const rev = (item.qty || 0) * (item.rate || item.sell || 0) || txn.amt || 0;
        // Estimate profit if cost is known
        const cost = item.cost || 0;
        const prof = rev - item.qty * cost || txn.profit || 0;

        pmap[id].units += item.qty || 0;
        pmap[id].revenue += rev;
        pmap[id].profit += prof;
      });
    });

    let arr = Object.values(pmap).map((p) => ({
      ...p,
      margin: p.revenue > 0 ? Number(((p.profit / p.revenue) * 100).toFixed(1)) : 0,
    }));

    arr.sort((a, b) => {
      let valA = String(a[sortConfig.key] || '').toLowerCase();
      let valB = String(b[sortConfig.key] || '').toLowerCase();

      if (!isNaN(a[sortConfig.key]) && !isNaN(b[sortConfig.key])) {
        valA = Number(a[sortConfig.key]);
        valB = Number(b[sortConfig.key]);
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    console.log('GRID DATA:', arr);
    return arr;
  }, [salesData, sortConfig]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const renderEmptyState = (msg) => (
    <div className="h-full flex flex-col items-center justify-center gap-6 text-[var(--text-secondary)] opacity-30 py-20 text-center">
      <LineChartIcon className="w-16 h-16" />
      <p className="text-xl font-black uppercase tracking-widest">
        {msg || t('analytics.noAnalyticsData')}
      </p>
      <p className="text-sm font-bold">{t('analytics.noDataCta')}</p>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* CHARTS GRID 1: TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sales Trend Analysis */}
        <div className="lg:col-span-2 brutalist-card hover:shadow-[8px_8px_0_var(--shadow-color)] transition-shadow">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10 pb-4 border-b-2 border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--color-accent)] flex items-center justify-center shadow-[2px_2px_0_var(--shadow-color)]">
                <LineChartIcon className="w-5 h-5 text-[#111111]" />
              </div>
              <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-widest">
                {t('analytics.salesTrendTitle')}
              </p>
            </div>
            <div className="flex border-2 border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)]">
              {['daily', 'weekly', 'monthly'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 text-xs font-black uppercase transition-colors ${timeRange === range ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                >
                  {t(`analytics.${range}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] flex-1">
            {salesData.length > 0 ? (
              <Line key={lang} data={lineData} options={lineOptions} />
            ) : (
              renderEmptyState()
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="brutalist-card hover:shadow-[8px_8px_0_var(--shadow-color)] transition-shadow">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10 pb-4 border-b-2 border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border-2 border-[var(--border-color)] bg-[var(--color-secondary)] flex items-center justify-center shadow-[2px_2px_0_var(--shadow-color)] text-[#ffffff]">
                <PieChart className="w-5 h-5" />
              </div>
              <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-widest">
                {t('analytics.categoryShare')}
              </p>
            </div>
            <div className="flex border-2 border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)]">
              {['revenue', 'qty'].map((toggle) => (
                <button
                  key={toggle}
                  onClick={() => setDonutToggle(toggle)}
                  className={`px-3 py-1 text-[10px] font-black uppercase transition-colors ${donutToggle === toggle ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                >
                  {t(`analytics.${toggle}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] flex-1">
            {donutData.labels.length > 0 ? (
              <Doughnut key={lang} data={donutData} options={donutOptions} />
            ) : (
              renderEmptyState(t('analytics.noData'))
            )}
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: PROFIT COMPOSITION & PERFORMANCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Profit Breakdown Analysis */}
        <div className="brutalist-card hover:shadow-[8px_8px_0_var(--shadow-color)] transition-shadow">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-[var(--border-color)]">
            <div className="w-10 h-10 border-2 border-[var(--border-color)] bg-[#00C853] flex items-center justify-center shadow-[2px_2px_0_var(--shadow-color)]">
              <TrendingUp className="w-5 h-5 text-[#111111]" />
            </div>
            <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-widest">
              {t('analytics.profitComposition')}
            </p>
          </div>
          <div className="h-[350px]">
            {salesData.length > 0 ? (
              <Bar key={lang} data={stackedBarData} options={stackedBarOptions} />
            ) : (
              renderEmptyState()
            )}
          </div>
        </div>

        {/* Product Performance Grid */}
        <div className="brutalist-card flex flex-col hover:shadow-[8px_8px_0_var(--shadow-color)] transition-shadow overflow-hidden">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-[var(--border-color)]">
            <div className="w-10 h-10 border-2 border-[var(--border-color)] bg-[#FF4081] flex items-center justify-center shadow-[2px_2px_0_var(--shadow-color)]">
              <Package className="w-5 h-5 text-[#ffffff]" />
            </div>
            <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-widest">
              {t('analytics.productGrid')}
            </p>
          </div>
          <div className="flex-1 overflow-auto brutalist-table-wrap min-h-[300px]">
            <ErrorBoundary fallback={renderEmptyState()}>
              <table className="brutalist-table w-full text-sm">
                <thead className="sticky top-0 bg-[var(--card-bg)] z-10 shadow-sm border-b-4 border-[var(--border-color)]">
                  <tr>
                    <th
                      className="cursor-pointer hover:bg-[var(--bg-secondary)]"
                      onClick={() => handleSort('product')}
                    >
                      <div className="flex items-center gap-2">
                        {t('inventory.product')}{' '}
                        {sortConfig.key === 'product' &&
                          (sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer hover:bg-[var(--bg-secondary)]"
                      onClick={() => handleSort('units')}
                    >
                      <div className="flex items-center gap-2">
                        {t('analytics.units')}{' '}
                        {sortConfig.key === 'units' &&
                          (sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer hover:bg-[var(--bg-secondary)]"
                      onClick={() => handleSort('revenue')}
                    >
                      <div className="flex items-center gap-2">
                        {t('analytics.revenue')}{' '}
                        {sortConfig.key === 'revenue' &&
                          (sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer hover:bg-[var(--bg-secondary)]"
                      onClick={() => handleSort('margin')}
                    >
                      <div className="flex items-center gap-2">
                        {t('analytics.margin')}{' '}
                        {sortConfig.key === 'margin' &&
                          (sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!productGridData ||
                  !Array.isArray(productGridData) ||
                  !productGridData.length ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 opacity-50 font-bold uppercase tracking-widest"
                      >
                        {t('analytics.noDataCta')}
                      </td>
                    </tr>
                  ) : (
                    productGridData.slice(0, 10).map((row, i) => (
                      <tr
                        key={row?.id || i}
                        className={i === 0 ? 'bg-[var(--color-brand)]/10' : ''}
                      >
                        <td className="font-bold uppercase truncate max-w-[150px]">
                          {row?.product ?? 'N/A'}
                        </td>
                        <td className="font-black">{row?.units ?? 0}</td>
                        <td className="font-bold italic">
                          ₹{(row?.revenue ?? 0).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs font-black border-2 border-[var(--border-color)] ${Number(row?.margin ?? 0) < 15 ? 'bg-[#FF4081] text-white' : 'bg-[#00C853] text-[#111111]'}`}
                          >
                            {row?.margin ?? 0}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

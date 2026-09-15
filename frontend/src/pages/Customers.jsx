import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit,
  FileText,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';

import { Modal } from '../components/UI/Modal';
import { useToast } from '../components/UI/ToastContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { formatCurrency } from '../lib/calc';
import { toDateLabel, toDateTime } from '../lib/dates';

export function Customers() {
  const toast = useToast();
  const { t = (k) => k } = useTranslation();
  const { customers, sales, saveCustomer, deleteCustomer, getCustomerStats, settleCustomerDues } =
    useData();

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Add / edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });

  // Settlement modal
  const [settlementCustomer, setSettlementCustomer] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementMethod, setSettlementMethod] = useState('Cash');

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          String(c.name || '')
            .toLowerCase()
            .includes(String(search || '').toLowerCase()) || String(c.phone || '').includes(search)
      ),
    [customers, search]
  );

  const openAddModal = () => {
    setEditId(null);
    setForm({ name: '', phone: '', address: '', notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditId(c.id);
    setForm({
      name: c.name || '',
      phone: c.phone || '',
      address: c.address || '',
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Customer name is required');
    saveCustomer(
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        createdAt: editId ? undefined : new Date().toISOString(),
      },
      editId
    );
    toast.success(editId ? 'Customer updated' : 'Customer added');
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this customer? Their transaction history will remain.')) return;
    deleteCustomer(id);
    toast.success('Customer removed');
  };

  const handleSettle = () => {
    if (!settlementAmount || Number(settlementAmount) <= 0)
      return toast.error('Enter a valid amount');
    const surplus = settleCustomerDues(
      settlementCustomer.id,
      Number(settlementAmount),
      settlementMethod
    );
    const msg =
      surplus > 0
        ? `Dues cleared. Advance of ${formatCurrency(surplus)} recorded.`
        : 'All dues cleared successfully';
    toast.success(msg);
    setSettlementCustomer(null);
    setSettlementAmount('');
  };

  const f = (k) => form[k];
  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="page-header">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            className="brutalist-input !pl-12"
            placeholder={t('customers.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="brutalist-btn btn-lg gap-3 shrink-0" onClick={openAddModal}>
          <Plus className="w-5 h-5" /> {t('customers.addCustomer')}
        </button>
      </div>

      {/* ── TABLE ── */}
      <div className="brutalist-table-wrap">
        <table className="brutalist-table">
          <thead>
            <tr>
              <th>{t('customers.customer')}</th>
              <th>{t('customers.contact')}</th>
              <th>{t('customers.lifetimeValue')}</th>
              <th>{t('customers.khataDue')}</th>
              <th>{t('customers.lastVisit')}</th>
              <th className="text-right">{t('customers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => {
                const stats = getCustomerStats(c.id);
                const isExpanded = expandedId === c.id;
                const customerSales = sales
                  .filter((s) => String(s.customerId) === String(c.id))
                  .sort((a, b) => (b.date > a.date ? 1 : -1));

                return (
                  <>
                    <tr key={c.id} className={isExpanded ? '!bg-[var(--bg-secondary)]' : ''}>
                      <td>
                        <button
                          className="flex items-center gap-2 text-left hover:text-[var(--color-brand)] transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        >
                          <div className="w-8 h-8 border-2 border-[var(--border-color)] bg-[var(--color-brand)] flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-[#111111]" />
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase italic">{c.name}</p>
                            {c.address && (
                              <p className="text-xs text-[var(--text-secondary)] font-bold">
                                {c.address}
                              </p>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 ml-1 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
                          )}
                        </button>
                      </td>
                      <td>
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="flex items-center gap-1 font-bold text-sm hover:text-[var(--color-brand)] transition-colors"
                          >
                            <Phone className="w-3 h-3" /> {c.phone}
                          </a>
                        ) : (
                          <span className="opacity-30">—</span>
                        )}
                      </td>
                      <td>
                        <span className="font-black text-base">
                          {formatCurrency(stats.lifetimeValue)}
                        </span>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)]">
                          {stats.txnCount} transactions
                        </p>
                      </td>
                      <td>
                        {stats.totalDue > 0 ? (
                          <div>
                            <span className="font-black text-lg text-[var(--color-error)]">
                              {formatCurrency(stats.totalDue)}
                            </span>
                            <button
                              className="brutalist-btn btn-sm gap-1 mt-1 bg-[var(--color-secondary)] text-white block"
                              onClick={() => {
                                setSettlementCustomer(c);
                                setSettlementAmount(String(stats.totalDue));
                              }}
                            >
                              {t('customers.payDues')}
                            </button>
                          </div>
                        ) : (
                          <span className="badge badge-paid text-[10px]">
                            {t('customers.cleared')}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-xs font-bold">
                          {toDateLabel(stats.lastVisit) || '—'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="brutalist-btn btn-sm btn-icon bg-transparent hover:bg-[var(--color-brand)] hover:text-[#111111]"
                            onClick={() => openEditModal(c)}
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="brutalist-btn btn-sm btn-icon bg-transparent hover:bg-[var(--color-error)] hover:text-white"
                            onClick={() => handleDelete(c.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── INLINE LEDGER ── */}
                    {isExpanded && (
                      <tr key={`${c.id}-ledger`}>
                        <td colSpan="6" className="p-0">
                          <div className="bg-[var(--bg-secondary)] border-t-2 border-b-2 border-[var(--border-color)] px-6 py-4">
                            <p className="section-title flex items-center gap-2 mb-3">
                              <FileText className="w-3.5 h-3.5" />{' '}
                              {t('customers.transactionHistory')} — {c.name}
                            </p>
                            {customerSales.length === 0 ? (
                              <p className="text-sm font-bold text-[var(--text-secondary)] py-4 text-center">
                                {t('customers.noTransactionsYet')}
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {customerSales.map((s) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center justify-between border-2 border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2"
                                  >
                                    <div>
                                      <p className="text-xs font-black uppercase">{s.id}</p>
                                      <p className="text-[10px] font-bold text-[var(--text-secondary)]">
                                        {toDateTime(s.date)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-black text-sm">
                                        {formatCurrency(s.total)}
                                      </p>
                                      {s.due > 0 && (
                                        <p className="text-[10px] font-bold text-[var(--color-error)]">
                                          {t('customers.dueLabel')}: {formatCurrency(s.due)}
                                        </p>
                                      )}
                                    </div>
                                    <span
                                      className={`badge text-[9px] ml-3 ${s.status === 'PAID' ? 'badge-paid' : s.status === 'PARTIAL' ? 'badge-partial' : 'badge-due'}`}
                                    >
                                      {s.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-24">
                  <div className="flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)] opacity-30">
                    <User className="w-16 h-16" />
                    <p className="text-lg font-black uppercase tracking-widest">
                      {t('customers.noCustomers')}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? t('customers.editCustomer') : t('customers.newCustomer')}
        actions={
          <div className="flex gap-3">
            <button
              className="brutalist-btn brutalist-btn-ghost"
              onClick={() => setIsModalOpen(false)}
            >
              {t('customers.cancel')}
            </button>
            <button className="brutalist-btn" onClick={handleSave}>
              {editId ? t('customers.update') : t('customers.save')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="section-title text-[10px]">{t('customers.fullName')} *</label>
            <input
              className="brutalist-input"
              value={f('name')}
              onChange={set('name')}
              placeholder={t('customers.fullNamePlaceholder')}
            />
          </div>
          <div>
            <label className="section-title text-[10px]">{t('customers.phoneNumber')}</label>
            <input
              type="tel"
              className="brutalist-input"
              value={f('phone')}
              onChange={set('phone')}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="section-title text-[10px]">{t('customers.address')}</label>
            <input
              className="brutalist-input"
              value={f('address')}
              onChange={set('address')}
              placeholder={t('customers.addressPlaceholder')}
            />
          </div>
          <div>
            <label className="section-title text-[10px]">{t('customers.notes')}</label>
            <textarea
              className="brutalist-input resize-none"
              rows={3}
              value={f('notes')}
              onChange={set('notes')}
              placeholder={t('customers.notesPlaceholder')}
            />
          </div>
        </div>
      </Modal>

      {/* ── SETTLEMENT MODAL ── */}
      {settlementCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setSettlementCustomer(null)}
          title={t('customers.settlement')}
          actions={
            <div className="flex gap-3">
              <button
                className="brutalist-btn brutalist-btn-ghost"
                onClick={() => setSettlementCustomer(null)}
              >
                {t('customers.cancel')}
              </button>
              <button
                className="brutalist-btn bg-[var(--color-success)] text-[#111111]"
                onClick={handleSettle}
              >
                <CheckCircle2 className="w-4 h-4" /> {t('customers.confirmPayment')}
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="border-4 border-[var(--border-color)] p-4 bg-[var(--bg-secondary)] flex justify-between items-center">
              <div>
                <p className="font-black uppercase text-sm">{settlementCustomer.name}</p>
                <p className="text-xs text-[var(--text-secondary)] font-bold">
                  {t('customers.totalOutstanding')}
                </p>
              </div>
              <p className="text-2xl font-black text-[var(--color-error)]">
                {formatCurrency(getCustomerStats(settlementCustomer.id).totalDue)}
              </p>
            </div>
            <div>
              <label className="section-title text-[10px]">{t('customers.amountToPay')} (₹)</label>
              <input
                type="number"
                min="0"
                className="brutalist-input text-3xl font-black text-center"
                value={settlementAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setSettlementAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="section-title text-[10px]">{t('customers.paymentMode')}</label>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'UPI', 'Card'].map((mode) => (
                  <button
                    key={mode}
                    className={`py-2 border-2 border-[var(--border-color)] text-xs font-black uppercase transition-all ${settlementMethod === mode ? 'bg-[var(--color-brand)] text-[#111111]' : 'bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)]'}`}
                    onClick={() => setSettlementMethod(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

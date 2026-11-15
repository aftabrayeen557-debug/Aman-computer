import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Customer, CustomerCategory } from '../types';
import {
  Users,
  Search,
  Plus,
  Download,
  Phone,
  MapPin,
  Calendar,
  Ticket,
  Eye,
  Trash2,
  X,
  CreditCard,
  MessageSquare,
} from 'lucide-react';

const CATEGORIES: CustomerCategory[] = [
  'Student / Job Aspirant',
  'Regular Citizen',
  'Farmer / PM-Kisan',
  'Business / Trader',
];

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    exportCustomersCSV,
    receipts,
    setCurrentTab,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<CustomerCategory>('Student / Job Aspirant');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setName('');
    setPhone('+91 ');
    setEmail('');
    setAddress('Varanasi');
    setCategory('Student / Job Aspirant');
    setNotes('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      category,
      notes: notes.trim() || undefined,
    });
    setModalOpen(false);
  };

  const customerReceipts = selectedCustomer
    ? receipts.filter((r) => r.customerId === selectedCustomer.id || r.customerPhone === selectedCustomer.phone)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Customer Management Directory</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Maintain customer records, visit frequency, contact details, and transaction history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCustomersCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] bg-white/50 dark:bg-black/20 text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#857878] dark:text-[#B5A8A8]" />
          <input
            type="text"
            placeholder="Search customers by name, phone number, or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] text-xs text-[#1A1818] dark:text-[#E8E4E0] placeholder-[#857878] dark:placeholder-[#B5A8A8] outline-hidden focus:border-[#1A1818] dark:focus:border-[#E8E4E0]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                : 'bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
            }`}
          >
            All Categories ({customers.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                  : 'bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Customer Name & ID</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Visits</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(196,176,176,0.15)] dark:divide-[rgba(196,176,176,0.08)]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#857878] dark:text-[#B5A8A8]">
                    No customers found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Namaste%20${encodeURIComponent(cust.name)}`;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-[rgba(196,176,176,0.1)] transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">{cust.name}</div>
                        <div className="text-[10px] font-mono text-[#857878] dark:text-[#B5A8A8]">{cust.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[#1A1818] dark:text-[#E8E4E0]">{cust.phone}</div>
                        <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] truncate max-w-[160px]">
                          {cust.address}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-[#1A1818] dark:text-[#E8E4E0]">
                          {cust.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1818] dark:text-[#E8E4E0]">
                        {cust.totalVisits} visits
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{cust.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-[#857878] dark:text-[#B5A8A8]">
                        {cust.lastVisitDate}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 rounded-lg text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="View Profile & Transactions"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${cust.name} from customer directory?`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
              <div>
                <span className="text-[10px] font-mono text-[#857878] dark:text-[#B5A8A8] uppercase tracking-wider">
                  Customer Profile Card
                </span>
                <h3 className="text-xl font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                  {selectedCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#857878] dark:text-[#B5A8A8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono">Total Visits</div>
                <div className="text-lg font-bold font-mono text-[#1A1818] dark:text-[#E8E4E0]">
                  {selectedCustomer.totalVisits}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono">Total Spent</div>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{selectedCustomer.totalSpent}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono">Category</div>
                <div className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] truncate mt-1">
                  {selectedCustomer.category}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono">Registered</div>
                <div className="text-xs font-mono text-[#1A1818] dark:text-[#E8E4E0] mt-1">
                  {selectedCustomer.createdAt}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-[rgba(196,176,176,0.2)] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#1A1818] dark:text-[#E8E4E0]">
                <Phone className="w-3.5 h-3.5 text-[#857878]" />
                <span className="font-mono">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1818] dark:text-[#E8E4E0]">
                <MapPin className="w-3.5 h-3.5 text-[#857878]" />
                <span>{selectedCustomer.address}</span>
              </div>
              {selectedCustomer.notes && (
                <div className="pt-2 text-[11px] text-[#857878] dark:text-[#B5A8A8] border-t border-[rgba(196,176,176,0.15)]">
                  Note: {selectedCustomer.notes}
                </div>
              )}
            </div>

            {/* Token Transactions History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                <span>Transaction & Slip History</span>
                <span className="text-[#857878] dark:text-[#B5A8A8] font-mono font-normal text-[11px]">
                  {customerReceipts.length} slips on record
                </span>
              </div>

              {customerReceipts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-center text-xs text-[#857878] dark:text-[#B5A8A8]">
                  No past receipts associated with this customer yet.
                </div>
              ) : (
                <div className="divide-y divide-[rgba(196,176,176,0.15)] dark:divide-[rgba(196,176,176,0.08)] max-h-48 overflow-y-auto">
                  {customerReceipts.map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-[#1A1818] dark:text-[#E8E4E0]">
                          Token #{r.tokenNumber} — {r.serviceName}
                        </div>
                        <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono">
                          {r.createdAt} • Ref: {r.applicationRefNo || 'Counter'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                          ₹{r.totalAmount}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {r.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCurrentTab('receipts');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Issue New Token</span>
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] text-xs font-semibold text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
              <h3 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                Register New Customer
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Full Customer Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Chandra Maurya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Phone Number *
                </label>
                <input
                  required
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Customer Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CustomerCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Locality / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lanka, Varanasi - 221005"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Operator Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Prefers SMS alerts, applies for SSC / Railway..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] font-semibold hover:opacity-90"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

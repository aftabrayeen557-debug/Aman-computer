import React, { useState } from 'react';
import {
  ArrowRight,
  Download,
  Eye,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Customer, CustomerCategory } from '../types';
import { CmsModal, CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';

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
    deleteCustomer,
    exportCustomersCSV,
    receipts,
    setCurrentTab,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
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
      address: address.trim(),
      category,
      notes: notes.trim() || undefined,
    });
    setModalOpen(false);
  };

  const customerReceipts = selectedCustomer
    ? receipts.filter(
        (r) =>
          r.customerId === selectedCustomer.id ||
          r.customerPhone === selectedCustomer.phone
      )
    : [];

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Client Directory"
        title="Customers"
        description="Maintain client records, contact numbers, visit frequency, and counter history."
        actions={
          <>
            <button
              type="button"
              onClick={exportCustomersCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-[#141419] text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/40 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </>
        }
      />

      <CmsSurfaceCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85838A]" />
            <input
              type="text"
              placeholder="Search customers by name, phone number, or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#211B16] border border-[#C9A96E]/40 text-[#DFC492]'
                  : 'bg-[#0A0A0E] border border-white/[0.07] text-[#85838A] hover:text-[#E8E5DF]'
              }`}
            >
              All ({customers.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#211B16] border border-[#C9A96E]/40 text-[#DFC492]'
                    : 'bg-[#0A0A0E] border border-white/[0.07] text-[#85838A] hover:text-[#E8E5DF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </CmsSurfaceCard>

      {/* Table */}
      <div className="rounded-2xl bg-[#141419] border border-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#101014] text-[#85838A] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Customer Name &amp; ID</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Visits</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#85838A]">
                    No customers match your current filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Namaste%20${encodeURIComponent(
                    cust.name
                  )}`;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#E8E5DF]">{cust.name}</div>
                        <div className="text-[10px] font-mono text-[#85838A]">{cust.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[#E8E5DF]">{cust.phone}</div>
                        <div className="text-[10px] text-[#85838A] truncate max-w-[160px]">
                          {cust.address}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#211B16] border border-[#C9A96E]/25 text-[#DFC492]">
                          {cust.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#E8E5DF]">
                        {cust.totalVisits} visits
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        ₹{cust.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-[#85838A]">
                        {cust.lastVisitDate}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 rounded-lg text-[#C9A96E] hover:bg-white/[0.05] transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(`Remove ${cust.name} from customer directory?`)
                              ) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

      {/* Customer Detail Modal */}
      <CmsModal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || ''}
        subtitle={selectedCustomer ? `${selectedCustomer.category} · ${selectedCustomer.id}` : ''}
        maxWidthClass="max-w-xl"
      >
        {selectedCustomer && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#101014] border border-white/[0.06]">
                <div className="text-[10px] text-[#85838A] font-mono">Total Visits</div>
                <div className="text-lg font-mono text-[#E8E5DF] mt-0.5">
                  {selectedCustomer.totalVisits}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#101014] border border-white/[0.06]">
                <div className="text-[10px] text-[#85838A] font-mono">Total Spent</div>
                <div className="text-lg font-mono text-emerald-400 mt-0.5">
                  ₹{selectedCustomer.totalSpent}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#101014] border border-white/[0.06]">
                <div className="text-[10px] text-[#85838A] font-mono">Category</div>
                <div className="text-xs font-medium text-[#DFC492] truncate mt-1">
                  {selectedCustomer.category}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#101014] border border-white/[0.06]">
                <div className="text-[10px] text-[#85838A] font-mono">Registered</div>
                <div className="text-xs font-mono text-[#E8E5DF] mt-1">
                  {selectedCustomer.createdAt}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101014] border border-white/[0.06] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#E8E5DF]">
                <Phone className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span className="font-mono">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#E8E5DF]">
                <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>{selectedCustomer.address}</span>
              </div>
              {selectedCustomer.notes && (
                <div className="pt-2 text-[11px] text-[#85838A] border-t border-white/[0.06]">
                  Note: {selectedCustomer.notes}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[#E8E5DF]">
                <span>Past Slip History</span>
                <span className="text-[#85838A] font-mono text-[11px]">
                  {customerReceipts.length} records
                </span>
              </div>

              {customerReceipts.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#101014] border border-white/[0.06] text-center text-xs text-[#85838A]">
                  No past slips associated with this customer yet.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06] max-h-48 overflow-y-auto admin-studio-scroll">
                  {customerReceipts.map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#E8E5DF]">
                          Token #{r.tokenNumber} — {r.serviceName}
                        </div>
                        <div className="text-[10px] text-[#85838A] font-mono">
                          {r.createdAt} · Ref: {r.applicationRefNo || 'Counter'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-[#E8E5DF]">
                          ₹{r.totalAmount}
                        </div>
                        <div className="text-[10px] text-emerald-400">{r.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setCurrentTab('enquiries');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold cursor-pointer"
              >
                <span>View Enquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CmsModal>

      {/* Add Customer Modal */}
      <CmsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Customer"
        subtitle="Add a client record to the Aman Computer directory"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#E8E5DF] mb-1.5">
              Full Customer Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Ramesh Chandra Maurya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#E8E5DF] mb-1.5">
              Phone Number *
            </label>
            <input
              required
              type="text"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#E8E5DF] mb-1.5">
              Customer Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CustomerCategory)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#E8E5DF] mb-1.5">
              Locality / Address
            </label>
            <input
              type="text"
              placeholder="e.g. Lanka, Varanasi - 221005"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#E8E5DF] mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Prefers SMS alerts, applies for SSC / Railway..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold cursor-pointer"
            >
              Save Customer
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};

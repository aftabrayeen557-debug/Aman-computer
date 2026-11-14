import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, X, ArrowRight, CornerDownLeft, Layers, UserCheck, Receipt as ReceiptIcon, Users, Settings2, Database } from 'lucide-react';
import { AdminTab } from '../types';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    services,
    enquiries,
    customers,
    receipts,
    setCurrentTab,
    setSelectedEnquiry,
    exportEnquiriesCSV,
    exportCustomersCSV,
    exportReceiptsCSV,
    toggleDarkMode,
    setServiceModalOpen,
  } = useAdmin();

  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches: Array<{
      id: string;
      category: 'Customer' | 'Receipt' | 'Service' | 'Enquiry' | 'Admin Page' | 'Quick Action';
      title: string;
      subtitle: string;
      action: () => void;
    }> = [];

    // Search Admin Pages (20 modules)
    const pages: Array<{ tab: AdminTab; name: string; desc: string }> = [
      { tab: 'overview', name: 'Operations Overview', desc: 'Summary metrics, revenue charts & walk-in stats' },
      { tab: 'customers', name: 'Customer Directory', desc: 'Customer phone directory, spend & category filters' },
      { tab: 'enquiries', name: 'Customer Enquiries', desc: 'Customer requests, urgent form deadlines & WhatsApp' },
      { tab: 'services', name: 'Services & Rates', desc: 'All 16 digital services, price starting rates & TAT' },
      { tab: 'latest-updates', name: 'Latest Updates (Door 0)', desc: 'Sarkari jobs, admit cards, results & announcements' },
      { tab: 'doc-requirements', name: 'Documents Need (Door 1)', desc: 'Document checklists for citizen services' },
      { tab: 'gallery', name: 'Center Gallery (Door 4)', desc: 'Commercial printer setup & cyber cafe photos' },
      { tab: 'journey', name: 'Our Journey Timeline', desc: '2024-2026 chronological milestones' },
      { tab: 'website-content', name: 'Website CMS Sections', desc: 'Hero, About, Why Us & How It Works' },
      { tab: 'faqs', name: 'FAQ Management', desc: 'Frequently asked customer questions' },
      { tab: 'testimonials', name: 'Customer Testimonials', desc: 'Verified client reviews and ratings' },
      { tab: 'business-profile', name: 'Business Profile', desc: 'Proprietor, address, maps, UPI ID & timings' },
      { tab: 'receipts', name: 'Receipts & Tokens', desc: 'Counter POS tokens, challan fee, print receipts' },
      { tab: 'media', name: 'Media Vault', desc: 'Document templates, affidavit drafts & logo files' },
      { tab: 'reports', name: 'Reports & Analytics', desc: 'Revenue analytics, daily walk-in trends & CSV export' },
      { tab: 'notifications', name: 'Operational Alerts', desc: 'Urgent server rush alerts & toner warnings' },
      { tab: 'staff', name: 'Staff & Operators', desc: 'Terminal assignments and work shifts' },
      { tab: 'activity-logs', name: 'Activity Audit Trail', desc: 'Operator actions and event logging' },
      { tab: 'backup-restore', name: 'Backup & Restore', desc: 'Full JSON database download and import' },
      { tab: 'settings', name: 'Terminal Configuration', desc: 'Theme, currency, fee defaults and receipt notes' },
    ];

    pages.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tab.includes(q)) {
        matches.push({
          id: 'page-' + p.tab,
          category: 'Admin Page',
          title: p.name,
          subtitle: p.desc,
          action: () => {
            setCurrentTab(p.tab);
            setSearchModalOpen(false);
          },
        });
      }
    });

    // Search Customers
    customers.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        matches.push({
          id: c.id,
          category: 'Customer',
          title: `${c.name} (${c.category})`,
          subtitle: `${c.phone} • ${c.address} • Total Spent: ₹${c.totalSpent}`,
          action: () => {
            setCurrentTab('customers');
            setSearchModalOpen(false);
          },
        });
      }
    });

    // Search Receipts
    receipts.forEach((r) => {
      if (
        r.id.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        r.serviceName.toLowerCase().includes(q) ||
        (r.applicationRefNo && r.applicationRefNo.toLowerCase().includes(q)) ||
        `token ${r.tokenNumber}`.includes(q)
      ) {
        matches.push({
          id: r.id,
          category: 'Receipt',
          title: `Token #${r.tokenNumber} — ${r.customerName}`,
          subtitle: `${r.serviceName} • ₹${r.totalAmount} (${r.paymentMode}) • ${r.status}`,
          action: () => {
            setCurrentTab('receipts');
            setSearchModalOpen(false);
          },
        });
      }
    });

    // Search Services
    services.forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q)
      ) {
        matches.push({
          id: s.id,
          category: 'Service',
          title: s.title,
          subtitle: `${s.category} • Starting ${s.priceStartingAt} • TAT: ${s.tat}`,
          action: () => {
            setCurrentTab('services');
            setSearchModalOpen(false);
          },
        });
      }
    });

    // Search Enquiries
    enquiries.forEach((e) => {
      if (
        e.customerName.toLowerCase().includes(q) ||
        e.phoneNumber.includes(q) ||
        e.serviceName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      ) {
        matches.push({
          id: e.id,
          category: 'Enquiry',
          title: `${e.customerName} (${e.id})`,
          subtitle: `${e.serviceName} • Status: ${e.status.toUpperCase()} • ${e.phoneNumber}`,
          action: () => {
            setCurrentTab('enquiries');
            setSelectedEnquiry(e);
            setSearchModalOpen(false);
          },
        });
      }
    });

    // Quick Actions
    if ('export csv download customers'.includes(q)) {
      matches.push({
        id: 'act-export-cust',
        category: 'Quick Action',
        title: 'Export Customers to CSV',
        subtitle: 'Download customer phone directory and visit history',
        action: () => {
          exportCustomersCSV();
          setSearchModalOpen(false);
        },
      });
    }
    if ('export receipts tokens pos'.includes(q)) {
      matches.push({
        id: 'act-export-rcp',
        category: 'Quick Action',
        title: 'Export Receipts & Tokens to CSV',
        subtitle: 'Download billing records and payment breakdown',
        action: () => {
          exportReceiptsCSV();
          setSearchModalOpen(false);
        },
      });
    }
    if ('export csv download enquiries'.includes(q)) {
      matches.push({
        id: 'act-export-enq',
        category: 'Quick Action',
        title: 'Export Enquiries to CSV',
        subtitle: 'Download customer requests spreadsheet',
        action: () => {
          exportEnquiriesCSV();
          setSearchModalOpen(false);
        },
      });
    }
    if ('add service create new catalog'.includes(q)) {
      matches.push({
        id: 'act-add-srv',
        category: 'Quick Action',
        title: 'Add New Service Offering',
        subtitle: 'Create catalog offering for Aman Computer',
        action: () => {
          setCurrentTab('services');
          setServiceModalOpen(true);
          setSearchModalOpen(false);
        },
      });
    }
    if ('dark light mode theme toggle cord'.includes(q)) {
      matches.push({
        id: 'act-theme',
        category: 'Quick Action',
        title: 'Toggle Dark / Light Theme',
        subtitle: 'Switch application color palette',
        action: () => {
          toggleDarkMode();
          setSearchModalOpen(false);
        },
      });
    }

    return matches.slice(0, 10);
  }, [query, services, enquiries, customers, receipts]);

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.12)]">
          <Search className="w-5 h-5 text-[#857878] dark:text-[#B5A8A8] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search customers, tokens, services, enquiries, admin pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-hidden text-[#1A1818] dark:text-[#E8E4E0] placeholder-[#857878] dark:placeholder-[#B5A8A8] text-sm sm:text-base font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(196,176,176,0.2)] dark:bg-[rgba(196,176,176,0.1)] text-[#6B5C5C] dark:text-[#C4B0B0]">
            ESC
          </kbd>
          <button
            onClick={() => setSearchModalOpen(false)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#857878] dark:text-[#B5A8A8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[rgba(196,176,176,0.15)] dark:divide-[rgba(196,176,176,0.08)]">
          {query.trim() === '' ? (
            <div className="py-8 px-4 text-center">
              <div className="text-xs uppercase font-mono tracking-widest text-[#857878] dark:text-[#B5A8A8] mb-2">
                Quick Navigation Shortcuts
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['Customers', 'Receipts & Tokens', 'Enquiries', 'Services', 'Latest Updates', 'Reports', 'Backup'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(196,176,176,0.18)] dark:bg-[rgba(196,176,176,0.08)] hover:bg-[#1A1818] hover:text-[#E8E4E0] dark:hover:bg-[#E8E4E0] dark:hover:text-[#1A1818] transition-colors"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#857878] dark:text-[#B5A8A8]">
              No records found for "{query}". Try searching by customer phone, token #, or service name.
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={item.action}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(196,176,176,0.2)] dark:hover:bg-[rgba(196,176,176,0.1)] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(107,92,92,0.15)] dark:bg-[rgba(196,176,176,0.1)] flex items-center justify-center shrink-0 text-[#6B5C5C] dark:text-[#C4B0B0]">
                    {item.category === 'Customer' ? (
                      <Users className="w-4 h-4" />
                    ) : item.category === 'Receipt' ? (
                      <ReceiptIcon className="w-4 h-4" />
                    ) : item.category === 'Service' ? (
                      <Layers className="w-4 h-4" />
                    ) : item.category === 'Enquiry' ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <Settings2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1A1818] dark:text-[#E8E4E0] truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#6B5C5C] dark:text-[#C4B0B0]">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-[#857878] dark:text-[#B5A8A8] truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#857878] dark:text-[#B5A8A8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-2.5 bg-[rgba(196,176,176,0.1)] dark:bg-[rgba(0,0,0,0.2)] border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] flex items-center justify-between text-[11px] text-[#857878] dark:text-[#B5A8A8] font-mono">
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>ESC to close</span>
          </div>
          <span className="flex items-center gap-1">
            <span>Select</span>
            <CornerDownLeft className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

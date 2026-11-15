import React, { useMemo, useState } from 'react';
import { ArrowRight, CornerDownLeft, Search, UserCheck, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ALL_STUDIO_NAV_ITEMS } from '../config/navigation';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    setCurrentTab,
    ownerProfile,
    customers,
    enquiries,
    services,
  } = useAdmin();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return ALL_STUDIO_NAV_ITEMS.slice(0, 8).map((item) => ({
        id: `nav-${item.tab}`,
        group: item.groupTitle,
        title: item.label,
        subtitle: item.description,
        icon: item.icon,
        onSelect: () => {
          setCurrentTab(item.tab);
          setSearchModalOpen(false);
          setQuery('');
        },
      }));
    }

    const matches: Array<{
      id: string;
      group: string;
      title: string;
      subtitle: string;
      icon: React.ElementType;
      onSelect: () => void;
    }> = [];

    if (
      ownerProfile.fullName.toLowerCase().includes(trimmed) ||
      ownerProfile.designation.toLowerCase().includes(trimmed) ||
      ownerProfile.businessIdentity.toLowerCase().includes(trimmed) ||
      ownerProfile.email.toLowerCase().includes(trimmed) ||
      ownerProfile.bio.toLowerCase().includes(trimmed) ||
      'avatar photo bio social linkedin instagram facebook'.includes(trimmed)
    ) {
      matches.push({
        id: 'owner-profile-live',
        group: 'OWNER PROFILE',
        title: `${ownerProfile.fullName} — ${ownerProfile.designation}`,
        subtitle: `${ownerProfile.businessIdentity} · ${ownerProfile.email}`,
        icon: UserCheck,
        onSelect: () => {
          setCurrentTab('owner-profile');
          setSearchModalOpen(false);
          setQuery('');
        },
      });
    }

    ALL_STUDIO_NAV_ITEMS.forEach((item) => {
      if (
        item.label.toLowerCase().includes(trimmed) ||
        item.groupTitle.toLowerCase().includes(trimmed) ||
        item.description.toLowerCase().includes(trimmed) ||
        item.tab.includes(trimmed)
      ) {
        matches.push({
          id: `nav-${item.tab}`,
          group: item.groupTitle,
          title: item.label,
          subtitle: item.description,
          icon: item.icon,
          onSelect: () => {
            setCurrentTab(item.tab);
            setSearchModalOpen(false);
            setQuery('');
          },
        });
      }
    });

    enquiries.forEach((enq) => {
      if (
        enq.customerName.toLowerCase().includes(trimmed) ||
        enq.serviceName.toLowerCase().includes(trimmed) ||
        enq.phoneNumber.includes(trimmed)
      ) {
        matches.push({
          id: `enq-${enq.id}`,
          group: 'ENQUIRY',
          title: `${enq.customerName} — ${enq.serviceName}`,
          subtitle: `${enq.phoneNumber} · Status: ${enq.status.toUpperCase()}`,
          icon: Search,
          onSelect: () => {
            setCurrentTab('enquiries');
            setSearchModalOpen(false);
            setQuery('');
          },
        });
      }
    });

    customers.forEach((cust) => {
      if (
        cust.name.toLowerCase().includes(trimmed) ||
        cust.phone.includes(trimmed) ||
        cust.address.toLowerCase().includes(trimmed)
      ) {
        matches.push({
          id: `cust-${cust.id}`,
          group: 'CUSTOMER',
          title: cust.name,
          subtitle: `${cust.phone} · ${cust.address}`,
          icon: Search,
          onSelect: () => {
            setCurrentTab('customers');
            setSearchModalOpen(false);
            setQuery('');
          },
        });
      }
    });

    services.forEach((srv) => {
      if (
        srv.title.toLowerCase().includes(trimmed) ||
        srv.category.toLowerCase().includes(trimmed)
      ) {
        matches.push({
          id: `srv-${srv.id}`,
          group: 'SERVICE',
          title: srv.title,
          subtitle: `${srv.category} · Starting ${srv.priceStartingAt}`,
          icon: Search,
          onSelect: () => {
            setCurrentTab('services');
            setSearchModalOpen(false);
            setQuery('');
          },
        });
      }
    });

    return matches.slice(0, 12);
  }, [query, setCurrentTab, setSearchModalOpen, ownerProfile, enquiries, customers, services]);

  if (!searchModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-xs"
      onClick={() => setSearchModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Studio Workspace Search"
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#111318] border border-orange-500/30 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-4 h-4 text-orange-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results.length > 0) {
                results[0].onSelect();
              }
            }}
            placeholder="Search sections, owner profile, services, enquiries, or customers…"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#F5F2EC] placeholder-[#92949B]"
          />
          <button
            type="button"
            onClick={() => setSearchModalOpen(false)}
            className="p-1.5 rounded-lg text-[#92949B] hover:text-[#F5F2EC] hover:bg-[#191C22] transition-colors cursor-pointer"
            aria-label="Close search modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto admin-studio-scroll p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-[#92949B]">
              No matching sections or records found for "{query}".
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onSelect}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[#191C22] border border-transparent hover:border-orange-500/25 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#191C22] border border-white/[0.07] flex items-center justify-center text-orange-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#F5F2EC] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#92949B] shrink-0">
                          · {item.group}
                        </span>
                      </div>
                      <p className="text-xs text-[#92949B] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#090A0C]/70 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono text-[#92949B]">
          <span>ESC to dismiss</span>
          <span className="flex items-center gap-1.5">
            <span>Open top match</span>
            <CornerDownLeft className="w-3 h-3 text-orange-400" />
          </span>
        </div>
      </div>
    </div>
  );
};

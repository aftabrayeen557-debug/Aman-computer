import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { StaffMember, StaffRole } from '../types';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Clock,
  Laptop,
  CheckCircle2,
  Trash2,
  X,
  Edit3,
} from 'lucide-react';

const ROLES: StaffRole[] = [
  'Proprietor / Super Admin',
  'Senior Form Specialist',
  'Counter Assistant',
  'Data Entry Clerk',
];

export const StaffManagementView: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff } = useAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Counter Assistant');
  const [workstationId, setWorkstationId] = useState('Terminal 2 (Counter)');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [shift, setShift] = useState('08:00 AM – 04:30 PM');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName('');
    setRole('Counter Assistant');
    setWorkstationId('Terminal 2');
    setPhone('+91 ');
    setEmail('');
    setShift('08:00 AM – 04:30 PM');
    setStatus('active');
    setModalOpen(true);
  };

  const handleOpenEdit = (m: StaffMember) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
    setWorkstationId(m.workstationId);
    setPhone(m.phone);
    setEmail(m.email);
    setShift(m.shift);
    setStatus(m.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMember) {
      updateStaff(editingMember.id, {
        name: name.trim(),
        role,
        workstationId: workstationId.trim(),
        phone: phone.trim(),
        email: email.trim(),
        shift: shift.trim(),
        status,
      });
    } else {
      addStaff({
        name: name.trim(),
        role,
        workstationId: workstationId.trim(),
        phone: phone.trim(),
        email: email.trim(),
        shift: shift.trim(),
        status,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Staff & Counter Terminal Operators</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Assign counter terminals, define shifts, manage operator phone lines, and track operator responsibilities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Operator</span>
        </button>
      </div>

      {/* Staff Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#1A1818] dark:text-[#E8E4E0]">
                  {member.workstationId}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    member.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      : 'bg-gray-500/15 text-gray-700'
                  }`}
                >
                  {member.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#1A1818] dark:text-[#E8E4E0]">
                  {member.name}
                </h3>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  {member.role}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#857878] dark:text-[#B5A8A8] pt-2 border-t border-[rgba(196,176,176,0.15)]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6B5C5C]" />
                  <span className="font-mono">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#6B5C5C]" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#6B5C5C]" />
                  <span>{member.shift}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
              <span className="text-[10px] font-mono text-[#857878] dark:text-[#B5A8A8]">
                Joined: {member.joinedDate}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-1.5 rounded-lg text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  title="Edit Operator"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {member.role !== 'Proprietor / Super Admin' && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.name} from staff?`)) {
                        deleteStaff(member.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Staff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
              <h3 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                {editingMember ? 'Edit Staff Operator' : 'Add Staff Operator'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sunil Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Assigned Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Workstation Assignment
                </label>
                <input
                  type="text"
                  placeholder="Terminal 2 (Sarkari Forms)"
                  value={workstationId}
                  onChange={(e) => setWorkstationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Shift Timings
                  </label>
                  <input
                    type="text"
                    placeholder="08:00 AM – 04:30 PM"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Staff Email
                </label>
                <input
                  type="email"
                  placeholder="operator@amancomputervns.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
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
                  Save Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

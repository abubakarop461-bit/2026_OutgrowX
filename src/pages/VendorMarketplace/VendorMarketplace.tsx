import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapPin, Star, Filter, TrendingUp, Users, CheckCircle, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { VENDORS } from '../../data/vendors';
import { calculateROI } from '../../services/roiCalculator';
import type { VendorData } from '../../types';

export default function VendorMarketplace() {
  const { userProfile } = useApp();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'find' | 'business'>('find');
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);

  // Filter state
  const [stateFilter, setStateFilter] = useState(userProfile.state || 'All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('Any');
  const [priceFilter, setPriceFilter] = useState('Any');

  const filteredVendors = useMemo(() => {
    return VENDORS.filter(v => {
      if (stateFilter !== 'All' && !v.states.includes(stateFilter)) return false;
      if (typeFilter !== 'All' && v.type !== typeFilter) return false;
      if (ratingFilter === '4+' && v.rating < 4) return false;
      if (ratingFilter === '3+' && v.rating < 3) return false;
      if (priceFilter !== 'Any' && v.priceRange !== priceFilter) return false;
      return true;
    });
  }, [stateFilter, typeFilter, ratingFilter, priceFilter]);

  const handleGetQuote = (vendor: VendorData) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const quoteText = useMemo(() => {
    const name = userProfile.firstName || 'User';
    const bill = userProfile.billAmount || userProfile.avgBill || 3200;
    const area = userProfile.roofArea || userProfile.roofSqFt || 800;
    const state = userProfile.state || 'Maharashtra';
    const roi = calculateROI({
      state,
      billSize: Number(bill),
      roofArea: Number(area),
      roofType: 'flat'
    });
    return `Hello ${selectedVendor?.companyName || ''},

I am interested in installing a solar system and would like a quote. Based on my SuryaSetu AI assessment:

- Recommended Size: ${roi.systemSizeKW} kW
- Roof Area: ${area} sq ft
- Current Monthly Bill: ₹${Number(bill).toLocaleString('en-IN')}
- Location: ${state}
- Estimated Payback: ${roi.paybackYears} years

Please let me know your pricing, brands used, and availability for a site survey.

Thanks,
${name}`;
  }, [userProfile, selectedVendor]);

  const allStates = useMemo(() => {
    const states = new Set<string>();
    VENDORS.forEach(v => v.states.forEach(s => states.add(s)));
    return ['All', ...Array.from(states).sort()];
  }, []);

  return (
    <main className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('marketplace') || 'Solar Marketplace'}</h1>
        <p className="text-gray-400">Connect with top-rated solar installers and businesses.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1px' }}>
        <button
          className="px-4 py-2 font-medium transition-colors"
          style={{
            borderBottom: activeTab === 'find' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'find' ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }}
          onClick={() => setActiveTab('find')}
        >
          Find Installers
        </button>
        <button
          className="px-4 py-2 font-medium transition-colors"
          style={{
            borderBottom: activeTab === 'business' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'business' ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }}
          onClick={() => setActiveTab('business')}
        >
          Business Portal
        </button>
      </div>

      {activeTab === 'find' && (
        <div className="flex-col gap-6">
          {/* Filters */}
          <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <MapPin size={18} className="text-gray-400" />
              <select
                className="bg-transparent border-none outline-none text-sm text-primary cursor-pointer"
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
              >
                {allStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <Filter size={18} className="text-gray-400" />
              <select
                className="bg-transparent border-none outline-none text-sm text-primary cursor-pointer"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Installer">Installer</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <Star size={18} className="text-gray-400" />
              <select
                className="bg-transparent border-none outline-none text-sm text-primary cursor-pointer"
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
              >
                <option value="Any">Any Rating</option>
                <option value="4+">4+ Stars</option>
                <option value="3+">3+ Stars</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-gray-400 font-medium">₹</span>
              <select
                className="bg-transparent border-none outline-none text-sm text-primary cursor-pointer"
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
              >
                <option value="Any">Any Price</option>
                <option value="₹₹">₹₹</option>
                <option value="₹₹₹">₹₹₹</option>
                <option value="₹₹₹₹">₹₹₹₹</option>
              </select>
            </div>
            <span className="text-sm text-gray-400 ml-auto">{filteredVendors.length} vendors found</span>
          </div>

          {/* Grid */}
          <div className="vendor-grid">
            {filteredVendors.map(v => (
              <div key={v.id} className="vendor-card glass-card p-5 rounded-2xl flex flex-col h-full transition-all">
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-xl">{v.logo}</span>
                  </div>
                  <div className="vendor-info">
                    <h3 className="font-semibold text-lg leading-tight">{v.companyName}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-primary font-medium">{v.rating}</span>
                      <span>({v.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex-col gap-2 flex-grow">
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-gray-500">Type:</span> {v.type} · {v.states.slice(0, 2).join(', ')}
                  </p>
                  <div className="vendor-tags">
                    {v.specializations.slice(0, 3).map((spec, i) => (
                      <span key={i} className="badge badge--muted text-xs">{spec}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="font-medium text-gray-300">{v.priceRange}</span>
                  <button
                    className="btn btn-primary px-4 py-2 text-sm"
                    onClick={() => handleGetQuote(v)}
                  >
                    {t('getQuote') || 'Get Quote'} →
                  </button>
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 && (
              <div className="glass-card p-8 rounded-2xl text-center text-gray-400 col-span-full">
                No vendors match your filters. Try adjusting your criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="flex-col gap-8">
          {/* Simple Dashboard View */}
          <div className="grid-3 gap-4">
            <div className="glass-card p-5 rounded-xl" style={{ borderTop: '2px solid var(--accent-primary)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">New Leads</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Users className="text-accent" />
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Deals</p>
                  <p className="text-3xl font-bold">5</p>
                </div>
                <TrendingUp className="text-blue-400" />
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Converted</p>
                  <p className="text-3xl font-bold">23</p>
                </div>
                <CheckCircle className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="grid-3 gap-6">
            <div className="col-span-2 flex-col gap-4">
              <h3 className="text-xl font-semibold mb-2">Recent Leads</h3>

              <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-lg">Arjun Sharma</h4>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={14} /> Pune, Maharashtra</p>
                  <p className="text-sm mt-2 flex gap-2">
                    <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--bg-elevated)' }}>System: 4 kW</span>
                    <span className="px-2 py-1 rounded text-xs badge--green">Interest: High</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary px-3 py-1.5 text-sm">View Contact</button>
                  <button className="btn btn-primary px-3 py-1.5 text-sm">Mark Active</button>
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-lg">Priya Patel</h4>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={14} /> Mumbai, Maharashtra</p>
                  <p className="text-sm mt-2 flex gap-2">
                    <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--bg-elevated)' }}>System: 2.5 kW</span>
                    <span className="px-2 py-1 rounded text-xs badge--amber">Interest: Medium</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary px-3 py-1.5 text-sm">View Contact</button>
                  <button className="btn btn-primary px-3 py-1.5 text-sm">Mark Active</button>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl h-fit">
              <h3 className="font-semibold mb-4">Vendor Registration</h3>
              <p className="text-sm text-gray-400 mb-6">Want to receive verified solar leads? Register your business on SuryaSetu.</p>
              <form className="flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div className="form-group">
                  <label className="label">Company Name</label>
                  <input type="text" className="input" placeholder="Solar Co." />
                </div>
                <div className="form-group">
                  <label className="label">GSTIN</label>
                  <input type="text" className="input" placeholder="27XXXXX..." />
                </div>
                <button className="btn btn-primary w-full justify-center">Apply Now</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showModal && (
        <QuoteModal
          vendor={selectedVendor}
          quoteText={quoteText}
          onClose={() => { setShowModal(false); setSelectedVendor(null); }}
        />
      )}
    </main>
  );
}

const QuoteModal: React.FC<{
  vendor: VendorData | null;
  quoteText: string;
  onClose: () => void;
}> = ({ vendor, quoteText, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Get Quote">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Mail className="text-accent" /> Draft Inquiry
          </h3>
          <button className="text-gray-400 hover:text-primary transition-colors" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="text-gray-400 mb-4 text-sm">
            {vendor ? `Inquiry for ${vendor.companyName}` : 'Inquiry'} · Pre-filled from your AI Solar Report.
          </p>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-sm text-gray-300 font-mono whitespace-pre-line">{quoteText}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}>Send Inquiry</button>
        </div>
      </div>
    </div>
  );
};

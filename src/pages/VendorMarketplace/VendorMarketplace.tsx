import React, { useState, useMemo } from 'react';
import {
  Storefront, MapPin, Star, CheckCircle, Lightning,
  Buildings, Factory, HouseLine, Wrench, PlugCharging,
  BatteryCharging, Plant, Sun, Briefcase, X
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { VENDORS } from '../../data/vendors';
import { calculateROI } from '../../services/roiCalculator';
import type { VendorData } from '../../types';

// Helper to map logo string to Phosphor Icon
const VendorLogoIcon: React.FC<{ logoKey: string }> = ({ logoKey }) => {
  switch (logoKey) {
    case 'sun':       return <Sun size={20} color="var(--color-ember-orange)" />;
    case 'lightning': return <Lightning size={20} color="var(--color-brass)" />;
    case 'plant':     return <Plant size={20} color="#16a34a" />;
    case 'battery':   return <BatteryCharging size={20} color="var(--color-steel)" />;
    case 'factory':   return <Factory size={20} color="var(--color-graphite)" />;
    case 'buildings': return <Buildings size={20} color="var(--color-graphite)" />;
    case 'house':     return <HouseLine size={20} color="var(--color-ember-orange)" />;
    case 'wrench':    return <Wrench size={20} color="var(--color-brass)" />;
    case 'plug':      return <PlugCharging size={20} color="var(--color-steel)" />;
    default:          return <Sun size={20} color="var(--color-ember-orange)" />;
  }
};

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

  const filteredVendors = useMemo(() => {
    return VENDORS.filter(v => {
      if (stateFilter !== 'All' && !v.states.includes(stateFilter)) return false;
      if (typeFilter !== 'All' && v.type !== typeFilter) return false;
      if (ratingFilter === '4+' && v.rating < 4) return false;
      return true;
    });
  }, [stateFilter, typeFilter, ratingFilter]);

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

I am interested in installing a rooftop solar PV system and would like an official quote. Based on my SuryaSetu AI assessment:

• Recommended Capacity: ${roi.systemSizeKW} kW
• Roof Usable Area: ${area} sq ft
• Monthly Electricity Bill: ₹${Number(bill).toLocaleString('en-IN')}
• Location: ${state}
• Target Payback Period: ${roi.paybackYears} years
• Eligible PM Surya Ghar Subsidy: ₹${roi.subsidy.toLocaleString('en-IN')}

Please share your component specifications (ALMM modules, inverter brands), total turnkey cost, and availability for a site survey.

Regards,
${name}`;
  }, [userProfile, selectedVendor]);

  const allStates = useMemo(() => {
    const states = new Set<string>();
    VENDORS.forEach(v => v.states.forEach(s => states.add(s)));
    return ['All', ...Array.from(states).sort()];
  }, []);

  return (
    <main
      style={{
        background: 'var(--color-canvas-white)',
        minHeight: '100vh',
        padding: '32px 24px 80px',
        color: 'var(--color-graphite)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '16px' }}>
        {/* Tabs (Ventriloc Capsule Pill) */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'find' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('find')}
          >
            <Storefront size={15} style={{ marginRight: '6px', display: 'inline-block' }} />
            Find Empanelled Installers
          </button>
          <button
            className={`tab-btn ${activeTab === 'business' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            <Briefcase size={15} style={{ marginRight: '6px', display: 'inline-block' }} />
            Installer Business Portal
          </button>
        </div>

        {activeTab === 'find' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Filter Bar (Ash Container) */}
            <div
              style={{
                background: 'var(--color-ash)',
                borderRadius: 'var(--radius-cards)',
                padding: '16px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              {/* State Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>State:</span>
                <select
                  value={stateFilter}
                  onChange={e => setStateFilter(e.target.value)}
                  style={{ background: 'var(--color-canvas-white)', padding: '6px 12px', borderRadius: 'var(--radius-nav-pills)', fontSize: '13px', width: 'auto' }}
                >
                  {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role:</span>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  style={{ background: 'var(--color-canvas-white)', padding: '6px 12px', borderRadius: 'var(--radius-nav-pills)', fontSize: '13px', width: 'auto' }}
                >
                  <option value="All">All Vendor Types</option>
                  <option value="Installer">EPC Installers</option>
                  <option value="Manufacturer">Module Manufacturers</option>
                  <option value="Maintenance">O&amp;M Providers</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rating:</span>
                <select
                  value={ratingFilter}
                  onChange={e => setRatingFilter(e.target.value)}
                  style={{ background: 'var(--color-canvas-white)', padding: '6px 12px', borderRadius: 'var(--radius-nav-pills)', fontSize: '13px', width: 'auto' }}
                >
                  <option value="Any">All Ratings</option>
                  <option value="4+">★ 4.0 &amp; Above</option>
                </select>
              </div>
            </div>

            {/* Vendor Cards Grid (Ventriloc White 20px Cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredVendors.map(vendor => (
                <div
                  key={vendor.id}
                  style={{
                    background: 'var(--color-canvas-white)',
                    border: '1px solid var(--color-mist)',
                    borderRadius: 'var(--radius-cards)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <VendorLogoIcon logoKey={vendor.logo} />
                        </div>
                        <div>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0 }}>
                            {vendor.companyName}
                          </h3>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>{vendor.type}</span>
                        </div>
                      </div>

                      <span className="badge badge--ember">★ {vendor.rating}</span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-steel)', lineHeight: 1.5, marginBottom: '16px' }}>
                      {vendor.description}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-slate)', borderTop: '1px solid var(--color-mist)', paddingTop: '12px', marginBottom: '16px' }}>
                      <span><strong>{vendor.reviewCount * 4}</strong> Reviews</span>
                      <span><strong>{vendor.specializations[0] || 'Solar PV'}</strong></span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full justify-center"
                    style={{ fontSize: '13px' }}
                    onClick={() => handleGetQuote(vendor)}
                  >
                    Request Official Quote →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div style={{ background: 'var(--color-ash)', borderRadius: 'var(--radius-cards)', padding: '36px 32px', maxWidth: '640px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brass)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
              Solar Contractor Network
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '12px' }}>
              Register Your Solar Business
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-steel)', lineHeight: 1.6, marginBottom: '24px' }}>
              Receive direct quotation requests and verified solar consumer leads from your state's active Centralized Context Engine.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => alert('Installer registration submitted! Our network verification team will contact you within 24 hours.')}
            >
              Submit Empanelment Application →
            </button>
          </div>
        )}

        {/* Quote Modal */}
        {showModal && selectedVendor && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 200,
            }}
          >
            <div
              style={{
                background: 'var(--color-canvas-white)',
                borderRadius: 'var(--radius-cards)',
                padding: '32px',
                maxWidth: '560px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--color-mist)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0 }}>
                  Quote Request — {selectedVendor.companyName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-slate)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: 'var(--color-fog)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '16px', fontSize: '13px', color: 'var(--color-steel)', whiteSpace: 'pre-wrap', lineHeight: 1.5, marginBottom: '20px' }}>
                {quoteText}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    alert(`Quote request dispatched to ${selectedVendor.companyName}!`);
                    setShowModal(false);
                  }}
                >
                  Send Official Quote Request →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

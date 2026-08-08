import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Storefront, MapPin, Funnel, Star, CheckCircle, Lightning, Users,
  TrendUp, Envelope, CaretRight, X, ShieldCheck, Buildings, Factory,
  HouseLine, Wrench, PlugCharging, BatteryCharging, Plant, Sun,
  Briefcase, IdentificationCard, Plus
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { VENDORS } from '../../data/vendors';
import { calculateROI } from '../../services/roiCalculator';
import type { VendorData } from '../../types';

// Helper to map logo string to Phosphor Icon
const VendorLogoIcon: React.FC<{ logoKey: string }> = ({ logoKey }) => {
  switch (logoKey) {
    case 'sun':       return <Sun size={24} weight="duotone" color="#A8FF3E" />;
    case 'lightning': return <Lightning size={24} weight="duotone" color="#F59E0B" />;
    case 'plant':     return <Plant size={24} weight="duotone" color="#22C55E" />;
    case 'battery':   return <BatteryCharging size={24} weight="duotone" color="#60A5FA" />;
    case 'factory':   return <Factory size={24} weight="duotone" color="#A78BFA" />;
    case 'buildings': return <Buildings size={24} weight="duotone" color="#F472B6" />;
    case 'house':     return <HouseLine size={24} weight="duotone" color="#A8FF3E" />;
    case 'wrench':    return <Wrench size={24} weight="duotone" color="#F59E0B" />;
    case 'plug':      return <PlugCharging size={24} weight="duotone" color="#60A5FA" />;
    default:          return <Sun size={24} weight="duotone" color="#A8FF3E" />;
  }
};

export default function VendorMarketplace() {
  const { userProfile } = useApp();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'find' | 'business'>('find');
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

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
    <main className="container pb-12" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Page Header */}
      <header className="page-header mt-6 mb-6">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#7A9484', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '3px 10px', borderRadius: '999px', marginBottom: '0.5rem' }}>
          <Storefront size={13} weight="duotone" color="#A8FF3E" />
          MNRE &amp; DISCOM Verified Installer Network
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.125rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#ECF2EE' }}>
          {t('marketplace') || 'Solar Marketplace'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#7A9484', marginTop: '0.25rem' }}>
          Connect with empanelled solar installers, top module manufacturers, and maintenance partners in India.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="tabs mb-6">
        <button
          className={`tab-btn ${activeTab === 'find' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('find')}
          style={{ fontSize: '0.8125rem', padding: '8px 18px' }}
        >
          <Storefront size={15} weight="duotone" style={{ marginRight: '6px' }} />
          Find Installers &amp; Vendors
        </button>
        <button
          className={`tab-btn ${activeTab === 'business' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('business')}
          style={{ fontSize: '0.8125rem', padding: '8px 18px' }}
        >
          <Briefcase size={15} weight="duotone" style={{ marginRight: '6px' }} />
          Installer Business Portal
        </button>
      </div>

      {activeTab === 'find' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters Bar */}
          <div style={{
            background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
            padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center'
          }}>
            {/* State Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: '10px' }}>
              <MapPin size={15} weight="duotone" color="#7A9484" />
              <select
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8125rem', color: '#ECF2EE', cursor: 'pointer' }}
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
              >
                {allStates.map(s => <option key={s} value={s} style={{ background: '#0A1210', color: '#ECF2EE' }}>{s === 'All' ? 'All States' : s}</option>)}
              </select>
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: '10px' }}>
              <Funnel size={15} weight="duotone" color="#7A9484" />
              <select
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8125rem', color: '#ECF2EE', cursor: 'pointer' }}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="All" style={{ background: '#0A1210' }}>All Types</option>
                <option value="Installer" style={{ background: '#0A1210' }}>EPC Installer</option>
                <option value="Manufacturer" style={{ background: '#0A1210' }}>Module Manufacturer</option>
                <option value="Maintenance" style={{ background: '#0A1210' }}>O&amp;M Maintenance</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: '10px' }}>
              <Star size={15} weight="duotone" color="#F59E0B" />
              <select
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8125rem', color: '#ECF2EE', cursor: 'pointer' }}
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
              >
                <option value="Any" style={{ background: '#0A1210' }}>Any Rating</option>
                <option value="4+" style={{ background: '#0A1210' }}>4.0+ Stars</option>
                <option value="3+" style={{ background: '#0A1210' }}>3.0+ Stars</option>
              </select>
            </div>

            {/* Price Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.8125rem', color: '#7A9484', fontWeight: 600 }}>₹</span>
              <select
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8125rem', color: '#ECF2EE', cursor: 'pointer' }}
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
              >
                <option value="Any" style={{ background: '#0A1210' }}>Any Price Tier</option>
                <option value="₹₹" style={{ background: '#0A1210' }}>₹₹ (Standard)</option>
                <option value="₹₹₹" style={{ background: '#0A1210' }}>₹₹₹ (Premium Tier 1)</option>
              </select>
            </div>

            <span style={{ fontSize: '0.75rem', color: '#7A9484', marginLeft: 'auto', fontWeight: 600 }}>
              {filteredVendors.length} verified vendors found
            </span>
          </div>

          {/* Vendors Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredVendors.map(v => (
              <div
                key={v.id}
                style={{
                  background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px',
                  padding: '1.5rem 1.5rem', display: 'flex', flexDirection: 'column',
                  transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,255,62,0.25)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Vendor Header */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <VendorLogoIcon logoKey={v.logo} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ECF2EE', margin: 0, lineHeight: 1.2 }}>
                        {v.companyName}
                      </h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A8FF3E', background: 'rgba(168,255,62,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                        {v.priceRange}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.75rem' }}>
                      <Star size={13} weight="fill" color="#F59E0B" />
                      <span style={{ fontWeight: 700, color: '#ECF2EE' }}>{v.rating}</span>
                      <span style={{ color: '#4A6055' }}>({v.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.8125rem', color: '#7A9484', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {v.description}
                </p>

                {/* Certifications & Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                  {v.certifications.map((cert, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.6875rem', fontWeight: 600, color: '#22C55E',
                      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
                      padding: '2px 8px', borderRadius: '999px'
                    }}>
                      <CheckCircle size={11} weight="bold" />
                      {cert}
                    </span>
                  ))}
                  {v.specializations.map((spec, i) => (
                    <span key={i} style={{
                      fontSize: '0.6875rem', color: '#7A9484',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                      padding: '2px 8px', borderRadius: '999px'
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#4A6055', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} weight="duotone" color="#7A9484" />
                    {v.states.slice(0, 2).join(', ')}{v.states.length > 2 ? ` +${v.states.length - 2}` : ''}
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGetQuote(v)}
                    style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
                  >
                    Get Quote <CaretRight size={14} />
                  </button>
                </div>
              </div>
            ))}

            {filteredVendors.length === 0 && (
              <div style={{ gridColumn: '1 / -1', background: 'rgba(10,18,13,0.78)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#7A9484', border: '1px solid rgba(255,255,255,0.07)' }}>
                No vendors match your search filters. Try clearing or expanding your criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Analytics Stat Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#7A9484', fontWeight: 600 }}>New Qualified Leads</span>
                <Users size={18} weight="duotone" color="#A8FF3E" />
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.875rem', fontWeight: 800, color: '#A8FF3E', marginTop: '4px' }}>12</div>
              <span style={{ fontSize: '0.6875rem', color: '#4A6055' }}>Matched to your state license</span>
            </div>

            <div style={{ background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#7A9484', fontWeight: 600 }}>Active Proposals</span>
                <TrendUp size={18} weight="duotone" color="#60A5FA" />
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.875rem', fontWeight: 800, color: '#ECF2EE', marginTop: '4px' }}>5</div>
              <span style={{ fontSize: '0.6875rem', color: '#4A6055' }}>Site surveys scheduled</span>
            </div>

            <div style={{ background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#7A9484', fontWeight: 600 }}>Converted Installs</span>
                <CheckCircle size={18} weight="duotone" color="#22C55E" />
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.875rem', fontWeight: 800, color: '#22C55E', marginTop: '4px' }}>23</div>
              <span style={{ fontSize: '0.6875rem', color: '#4A6055' }}>PM Surya Ghar DBT released</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Leads Table */}
            <div style={{ background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem 1.75rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ECF2EE', margin: '0 0 1rem' }}>
                Recent Consumer Leads (State Empanelled)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ECF2EE' }}>Arjun Sharma</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} weight="duotone" /> Pune, Maharashtra · MSEDCL
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#A8FF3E', background: 'rgba(168,255,62,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Recommended: 4 kW</span>
                      <span style={{ fontSize: '0.6875rem', color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px' }}>High Intent</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>View Contact</button>
                    <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Send Proposal</button>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ECF2EE' }}>Priya Patel</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A9484', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} weight="duotone" /> Ahmedabad, Gujarat · UGVCL
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#A8FF3E', background: 'rgba(168,255,62,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Recommended: 3 kW</span>
                      <span style={{ fontSize: '0.6875rem', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Medium Intent</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>View Contact</button>
                    <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Send Proposal</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div style={{ background: 'rgba(10,18,13,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem 1.75rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ECF2EE', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IdentificationCard size={18} weight="duotone" color="#A8FF3E" />
                Vendor Onboarding &amp; Verification
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#7A9484', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Register your business to receive verified PM Surya Ghar consumer leads in your operating state.
              </p>

              {registeredSuccess ? (
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
                  <CheckCircle size={28} weight="duotone" color="#22C55E" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ECF2EE' }}>Application Submitted</div>
                  <div style={{ fontSize: '0.75rem', color: '#7A9484', marginTop: '4px' }}>Our verification team will review your GSTIN &amp; DISCOM empanelment within 24 hours.</div>
                </div>
              ) : (
                <form style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }} onSubmit={e => { e.preventDefault(); setRegisteredSuccess(true); }}>
                  <div className="form-group">
                    <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>Company Legal Name</label>
                    <input type="text" className="input" placeholder="e.g. Solarix Power India Pvt Ltd" required style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div className="form-group">
                    <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>GSTIN (Goods &amp; Services Tax ID)</label>
                    <input type="text" className="input" placeholder="e.g. 27AAAAA0000A1Z5" required style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div className="form-group">
                    <label className="label" style={{ fontSize: '0.75rem', color: '#7A9484' }}>DISCOM Empanelment License No.</label>
                    <input type="text" className="input" placeholder="e.g. DISCOM-EMP-2024-884" required style={{ fontSize: '0.875rem' }} />
                  </div>
                  <button className="btn btn-primary justify-center mt-1" type="submit" style={{ fontSize: '0.875rem' }}>
                    Submit Registration <Plus size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quote Inquiry Modal */}
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
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Get Quote">
      <div className="modal-content" ref={modalRef} style={{ background: '#0A1210', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', maxWidth: '520px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 1.5rem' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ECF2EE', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Envelope size={18} weight="duotone" color="#A8FF3E" />
            Official Turnkey Quote Inquiry
          </h3>
          <button style={{ background: 'transparent', border: 'none', color: '#7A9484', cursor: 'pointer' }} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <ShieldCheck size={16} weight="duotone" color="#22C55E" />
            <span style={{ fontSize: '0.75rem', color: '#7A9484' }}>
              Pre-populated from your AI Solar Assessment for {vendor?.companyName}
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.8125rem', color: '#ECF2EE', fontFamily: 'SF Mono, Fira Code, monospace', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
              {quoteText}
            </p>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.8125rem' }}>Cancel</button>
          <button className="btn btn-ghost" onClick={handleCopy} style={{ fontSize: '0.8125rem' }}>
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button className="btn btn-primary" onClick={onClose} style={{ fontSize: '0.8125rem' }}>
            Send Inquiry <CaretRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

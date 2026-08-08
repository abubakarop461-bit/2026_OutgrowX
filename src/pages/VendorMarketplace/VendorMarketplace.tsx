import React, { useState, useMemo } from 'react';
import {
  Storefront, MapPin, Star, CheckCircle, Lightning,
  Buildings, Factory, HouseLine, Wrench, PlugCharging,
  BatteryCharging, Plant, Sun, Briefcase, X, Envelope,
  SealCheck, ArrowRight, FunnelSimple, Buildings as BuildingsIcon,
  Certificate, Phone
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { VENDORS } from '../../data/vendors';
import { calculateROI } from '../../services/roiCalculator';
import type { VendorData } from '../../types';

const VendorLogoIcon: React.FC<{ logoKey: string; size?: number }> = ({ logoKey, size = 22 }) => {
  switch (logoKey) {
    case 'sun':       return <Sun size={size} color="var(--color-ember-orange)" />;
    case 'lightning': return <Lightning size={size} color="var(--color-brass)" />;
    case 'plant':     return <Plant size={size} color="#16a34a" />;
    case 'battery':   return <BatteryCharging size={size} color="var(--color-steel)" />;
    case 'factory':   return <Factory size={size} color="var(--color-graphite)" />;
    case 'buildings': return <Buildings size={size} color="var(--color-graphite)" />;
    case 'house':     return <HouseLine size={size} color="var(--color-ember-orange)" />;
    case 'wrench':    return <Wrench size={size} color="var(--color-brass)" />;
    case 'plug':      return <PlugCharging size={size} color="var(--color-steel)" />;
    default:          return <Sun size={size} color="var(--color-ember-orange)" />;
  }
};

const TYPE_COLORS: Record<string, string> = {
  Installer: '#1d4ed8',
  Manufacturer: '#7c3aed',
  Maintenance: '#065f46',
};

const typeLabel = (type: string) => ({
  Installer: 'EPC Installer',
  Manufacturer: 'Module Manufacturer',
  Maintenance: 'O&M Provider',
}[type] || type);

export default function VendorMarketplace() {
  const { userProfile, language } = useApp();
  const [activeTab, setActiveTab] = useState<'find' | 'business'>('find');
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  // Business portal form
  const [bizForm, setBizForm] = useState({
    company: '', contactName: '', email: '', phone: '',
    state: '', type: 'Installer', experience: '', certsHeld: '',
  });
  const [bizSubmitted, setBizSubmitted] = useState(false);

  // Filters
  const [stateFilter, setStateFilter] = useState(userProfile.state || 'All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('Any');
  const [certFilter, setCertFilter] = useState('Any');

  const filteredVendors = useMemo(() => {
    return VENDORS.filter(v => {
      if (stateFilter !== 'All' && !v.states.includes(stateFilter)) return false;
      if (typeFilter !== 'All' && v.type !== typeFilter) return false;
      if (ratingFilter === '4+' && v.rating < 4) return false;
      if (ratingFilter === '4.5+' && v.rating < 4.5) return false;
      if (certFilter === 'MNRE' && !v.certifications.some(c => c.includes('MNRE'))) return false;
      if (certFilter === 'ALMM' && !v.certifications.some(c => c.includes('ALMM'))) return false;
      if (certFilter === 'Tier1' && !v.certifications.some(c => c.includes('Tier 1'))) return false;
      return true;
    });
  }, [stateFilter, typeFilter, ratingFilter, certFilter]);

  const handleGetQuote = (vendor: VendorData) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const quoteText = useMemo(() => {
    const name = userProfile.firstName || 'User';
    const bill = userProfile.billAmount || userProfile.avgBill || 3200;
    const area = userProfile.roofArea || userProfile.roofSqFt || 800;
    const state = userProfile.state || 'Maharashtra';
    const roi = calculateROI({ state, billSize: Number(bill), roofArea: Number(area), roofType: 'flat' });
    return `Hello ${selectedVendor?.companyName || ''},

I am interested in installing a rooftop solar PV system and would like an official quotation. Based on my SuryaSetu AI Assessment:

  • Recommended Capacity: ${roi.systemSizeKW} kW
  • Roof Usable Area: ${area} sq ft
  • Monthly Electricity Bill: ₹${Number(bill).toLocaleString('en-IN')}
  • Location: ${state}
  • Payback Period Target: ${roi.paybackYears} years
  • PM Surya Ghar Subsidy Eligible: ₹${roi.subsidy.toLocaleString('en-IN')}

Please share component specs (ALMM modules, inverter brand), total turnkey cost breakdown, and next available slot for a site survey.

Regards,
${name}`;
  }, [userProfile, selectedVendor]);

  const allStates = useMemo(() => {
    const states = new Set<string>();
    VENDORS.forEach(v => v.states.forEach(s => states.add(s)));
    return ['All', ...Array.from(states).sort()];
  }, []);

  // Summary counts
  const installers = VENDORS.filter(v => v.type === 'Installer').length;
  const manufacturers = VENDORS.filter(v => v.type === 'Manufacturer').length;
  const maintenance = VENDORS.filter(v => v.type === 'Maintenance').length;

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const strings = {
    totalPartners: isHi ? "कुल भागीदार" : isMr ? "एकूण भागीदार" : "Total Partners",
    epcInstallers: isHi ? "EPC इंस्टॉलर्स" : isMr ? "EPC इंस्टॉलर्स" : "EPC Installers",
    manufacturers: isHi ? "सौर निर्माता" : isMr ? "सोलर उत्पादक" : "Manufacturers",
    omProviders: isHi ? "रखरखाव प्रदाता" : isMr ? "देखभाल प्रदाता" : "O&M Providers",
    findVerified: isHi ? "सत्यापित भागीदार खोजें" : isMr ? "सत्यापित भागीदार शोधा" : "Find Verified Partners",
    bizPortal: isHi ? "व्यवसाय पंजीकरण पोर्टल" : isMr ? "व्यवसाय नोंदणी पोर्टल" : "Business Registration Portal",
    filters: isHi ? "फ़िल्टर" : isMr ? "फिल्टर" : "Filters",
    state: isHi ? "राज्य" : isMr ? "राज्य" : "State",
    partnerType: isHi ? "भागीदार प्रकार" : isMr ? "भागीदार प्रकार" : "Partner Type",
    allPartners: isHi ? "सभी भागीदार" : isMr ? "सर्व भागीदार" : "All Partners",
    minRating: isHi ? "न्यूनतम रेटिंग" : isMr ? "किमान रेटिंग" : "Min Rating",
    allRatings: isHi ? "सभी रेटिंग" : isMr ? "सर्व रेटिंग" : "All Ratings",
    above4: isHi ? "★ 4.0 और ऊपर" : isMr ? "★ ४.० आणि अधिक" : "★ 4.0 & Above",
    above45: isHi ? "★ 4.5 और ऊपर" : isMr ? "★ ४.५ आणि अधिक" : "★ 4.5 & Above",
    certification: isHi ? "प्रमाणन" : isMr ? "प्रमाणपत्र" : "Certification",
    all: isHi ? "सभी" : isMr ? "सर्व" : "All",
    mnreEmpanelled: isHi ? "MNRE प्रमाणित" : isMr ? "MNRE प्रमाणित" : "MNRE Empanelled",
    almmListed: isHi ? "ALMM सूचीबद्ध" : isMr ? "ALMM सूचीबद्ध" : "ALMM Listed",
    tier1Mfg: isHi ? "टियर-1 निर्माता" : isMr ? "टियर-१ उत्पादक" : "Tier-1 Manufacturer",
    clearFilters: isHi ? "सभी फ़िल्टर साफ़ करें" : isMr ? "सर्व फिल्टर साफ करा" : "Clear All Filters",
    partnersFound: (count: number) => isHi ? `${count} भागीदार मिले` : isMr ? `${count} भागीदार सापडले` : `${count} partners found`,
    noPartners: isHi ? "कोई भागीदार नहीं मिला। अन्य फ़िल्टर आज़माएं।" : isMr ? "भागीदार सापडले नाहीत. इतर पर्याय निवडून पहा." : "No partners found for this filter combination. Try broadening your search.",
    getQuote: isHi ? "कोट प्राप्त करें" : isMr ? "दरपत्रक मिळवा" : "Get Quote",
    hideDetails: isHi ? "विवरण छुपाएं ↑" : isMr ? "तपशील लपवा ↑" : "Hide details ↑",
    viewDetails: isHi ? "विवरण देखें ↓" : isMr ? "तपशील पहा ↓" : "View details ↓",
    specializations: isHi ? "विशेषज्ञता" : isMr ? "विशेषीकरण" : "Specializations",
    allCerts: isHi ? "सभी प्रमाणपत्र" : isMr ? "सर्व प्रमाणपत्रे" : "All Certifications",
    serviceStates: isHi ? "सेवा प्रदान करने वाले राज्य" : isMr ? "कार्यरत राज्य" : "Service States",
    submitBizApp: isHi ? "व्यवसाय पंजीकरण सबमिट करें →" : isMr ? "व्यवसाय नोंदणी सबमिट करा →" : "Submit Empanelment Application →",
  };

  return (
    <main style={{ background: 'var(--color-canvas-white)', minHeight: '100vh', padding: '8px 24px 80px', color: 'var(--color-graphite)', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* ── Marketplace Stats Banner ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: strings.totalPartners, value: VENDORS.length, color: 'var(--color-graphite)' },
            { label: strings.epcInstallers, value: installers, color: '#1d4ed8' },
            { label: strings.manufacturers, value: manufacturers, color: '#7c3aed' },
            { label: strings.omProviders, value: maintenance, color: '#065f46' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--color-ash)', borderRadius: 'var(--radius-cards)', padding: '14px 18px' }}>
              <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 400, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-slate)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation ── */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          <button className={`tab-btn ${activeTab === 'find' ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab('find')}>
            <Storefront size={15} style={{ marginRight: '6px', display: 'inline-block' }} />
            {strings.findVerified}
          </button>
          <button className={`tab-btn ${activeTab === 'business' ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab('business')}>
            <Briefcase size={15} style={{ marginRight: '6px', display: 'inline-block' }} />
            {strings.bizPortal}
          </button>
        </div>

        {/* ══════════════════ FIND PARTNERS TAB ══════════════════ */}
        {activeTab === 'find' && (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}>

            {/* ── Sidebar Filters ── */}
            <div style={{ background: 'var(--color-ash)', borderRadius: 'var(--radius-cards)', padding: '20px', position: 'sticky', top: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
                <FunnelSimple size={15} color="var(--color-slate)" />
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>{strings.filters}</span>
              </div>

              {/* State */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{strings.state}</label>
                <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
                  style={{ width: '100%', background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', padding: '7px 10px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)' }}>
                  {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Partner Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{strings.partnerType}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['All', 'Installer', 'Manufacturer', 'Maintenance'].map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      style={{
                        textAlign: 'left', padding: '7px 10px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer',
                        background: typeFilter === t ? 'var(--color-graphite)' : 'var(--color-canvas-white)',
                        color: typeFilter === t ? '#fff' : 'var(--color-steel)',
                        fontFamily: 'var(--font-body)',
                      }}>
                      {t === 'All' ? strings.allPartners : (isHi ? (t === 'Installer' ? 'प्रमाणित इंस्टॉलर' : t === 'Manufacturer' ? 'सौर निर्माता' : 'रखरखाव प्रदाता') : isMr ? (t === 'Installer' ? 'प्रमाणित इंस्टॉलर' : t === 'Manufacturer' ? 'सोलर उत्पादक' : 'देखभाल प्रदाता') : typeLabel(t))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Rating */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{strings.minRating}</label>
                <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
                  style={{ width: '100%', background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', padding: '7px 10px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)' }}>
                  <option value="Any">{strings.allRatings}</option>
                  <option value="4+">{strings.above4}</option>
                  <option value="4.5+">{strings.above45}</option>
                </select>
              </div>

              {/* Certification */}
              <div style={{ marginBottom: '4px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{strings.certification}</label>
                <select value={certFilter} onChange={e => setCertFilter(e.target.value)}
                  style={{ width: '100%', background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', padding: '7px 10px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)' }}>
                  <option value="Any">{strings.all}</option>
                  <option value="MNRE">{strings.mnreEmpanelled}</option>
                  <option value="ALMM">{strings.almmListed}</option>
                  <option value="Tier1">{strings.tier1Mfg}</option>
                </select>
              </div>

              {(stateFilter !== 'All' || typeFilter !== 'All' || ratingFilter !== 'Any' || certFilter !== 'Any') && (
                <button onClick={() => { setStateFilter('All'); setTypeFilter('All'); setRatingFilter('Any'); setCertFilter('Any'); }}
                  style={{ marginTop: '14px', width: '100%', background: 'transparent', border: '1px solid var(--color-mist)', borderRadius: '6px', padding: '7px', fontSize: '12px', color: 'var(--color-slate)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {strings.clearFilters}
                </button>
              )}

              <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--color-slate)', borderTop: '1px solid var(--color-mist)', paddingTop: '14px' }}>
                {strings.partnersFound(filteredVendors.length)}
              </div>
            </div>

            {/* ── Vendor List ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredVendors.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-slate)', fontSize: '14px' }}>
                  {strings.noPartners}
                </div>
              )}

              {filteredVendors.map(vendor => {
                const isExpanded = expandedVendor === vendor.id;
                return (
                  <div key={vendor.id}
                    style={{ background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', overflow: 'hidden', transition: 'box-shadow 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#d0d0d0'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-mist)'}
                  >
                    {/* Row Main */}
                    <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '16px', padding: '18px 20px', alignItems: 'center' }}>
                      {/* Logo */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--color-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <VendorLogoIcon logoKey={vendor.logo} size={22} />
                      </div>

                      {/* Main Info */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--color-graphite)' }}>{vendor.companyName}</span>
                          <span style={{
                            fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '99px',
                            background: TYPE_COLORS[vendor.type] + '14',
                            color: TYPE_COLORS[vendor.type],
                            border: `1px solid ${TYPE_COLORS[vendor.type]}30`,
                          }}>{isHi ? (vendor.type === 'Installer' ? 'प्रमाणित इंस्टॉलर' : vendor.type === 'Manufacturer' ? 'सौर निर्माता' : 'रखरखाव प्रदाता') : isMr ? (vendor.type === 'Installer' ? 'प्रमाणित इंस्टॉलर' : vendor.type === 'Manufacturer' ? 'सोलर उत्पादक' : 'देखभाल प्रदाता') : typeLabel(vendor.type)}</span>
                          <span style={{ fontSize: '12px', color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>★ {vendor.rating}</span>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--color-steel)', margin: '0 0 8px', lineHeight: 1.5 }}>{vendor.description}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                          {/* Certifications */}
                          {vendor.certifications.slice(0, 3).map(cert => (
                            <span key={cert} style={{ fontSize: '11px', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-steel)' }}>
                              {cert}
                            </span>
                          ))}
                          {/* States */}
                          <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>
                            <MapPin size={11} style={{ display: 'inline', marginRight: '2px' }} />
                            {vendor.states.slice(0, 3).join(', ')}{vendor.states.length > 3 ? ` +${vendor.states.length - 3}` : ''}
                          </span>
                          {/* Reviews */}
                          <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>{vendor.reviewCount} {isHi ? 'समीक्षाएं' : isMr ? 'समीक्षा' : 'reviews'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px', alignItems: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 16px', whiteSpace: 'nowrap' }} onClick={() => handleGetQuote(vendor)}>
                          {strings.getQuote} <ArrowRight size={13} style={{ display: 'inline', marginLeft: '4px' }} />
                        </button>
                        <button
                          onClick={() => setExpandedVendor(isExpanded ? null : vendor.id)}
                          style={{ fontSize: '12px', color: 'var(--color-slate)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: '4px 0' }}>
                          {isExpanded ? strings.hideDetails : strings.viewDetails}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details Panel */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--color-mist)', background: 'var(--color-fog)', padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-slate)', marginBottom: '8px' }}>{strings.specializations}</div>
                          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {vendor.specializations.map(s => (
                              <li key={s} style={{ fontSize: '13px', color: 'var(--color-steel)' }}>
                                <CheckCircle size={12} color="var(--color-ember-orange)" style={{ display: 'inline', marginRight: '6px' }} />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-slate)', marginBottom: '8px' }}>{strings.allCerts}</div>
                          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {vendor.certifications.map(c => (
                              <li key={c} style={{ fontSize: '13px', color: 'var(--color-steel)' }}>
                                <SealCheck size={12} color="var(--color-brass)" style={{ display: 'inline', marginRight: '6px' }} />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-slate)', marginBottom: '8px' }}>{strings.serviceStates}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {vendor.states.map(s => (
                              <span key={s} style={{ fontSize: '11px', background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-steel)' }}>{s}</span>
                            ))}
                          </div>
                          <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-slate)' }}>
                            <Envelope size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {vendor.contactEmail}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════ BUSINESS PORTAL TAB ══════════════════ */}
        {activeTab === 'business' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

            {/* Left: Registration Form */}
            <div style={{ background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '32px' }}>
              {bizSubmitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CheckCircle size={48} color="var(--color-ember-orange)" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, marginBottom: '8px' }}>Application Submitted</h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-steel)', lineHeight: 1.6 }}>
                    Our partner verification team will review your credentials and contact you within <strong>2–3 business days</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '6px' }}>Register Your Solar Business</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-steel)', marginBottom: '24px', lineHeight: 1.5 }}>
                    Join India's fastest growing solar intelligence network and receive qualified, pre-assessed consumer leads directly to your inbox.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Company Name *</label>
                        <input type="text" value={bizForm.company} onChange={e => setBizForm(f => ({ ...f, company: e.target.value }))}
                          placeholder="e.g. SolarTech Pvt Ltd"
                          style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Contact Person *</label>
                        <input type="text" value={bizForm.contactName} onChange={e => setBizForm(f => ({ ...f, contactName: e.target.value }))}
                          placeholder="Full name"
                          style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Business Email *</label>
                        <input type="email" value={bizForm.email} onChange={e => setBizForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="you@company.com"
                          style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Phone</label>
                        <input type="tel" value={bizForm.phone} onChange={e => setBizForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Primary State</label>
                        <select value={bizForm.state} onChange={e => setBizForm(f => ({ ...f, state: e.target.value }))}
                          style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }}>
                          <option value="">Select state</option>
                          {['Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana', 'Bihar', 'West Bengal', 'Others'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Business Type</label>
                        <select value={bizForm.type} onChange={e => setBizForm(f => ({ ...f, type: e.target.value }))}
                          style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }}>
                          <option value="Installer">EPC Installer</option>
                          <option value="Manufacturer">Module Manufacturer</option>
                          <option value="Maintenance">O&M Provider</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Certifications & Empanelments</label>
                      <input type="text" value={bizForm.certsHeld} onChange={e => setBizForm(f => ({ ...f, certsHeld: e.target.value }))}
                        placeholder="e.g. MNRE Empanelled, ISO 9001, ALMM..."
                        style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Years in Solar Industry</label>
                      <select value={bizForm.experience} onChange={e => setBizForm(f => ({ ...f, experience: e.target.value }))}
                        style={{ width: '100%', background: 'var(--color-fog)', border: '1px solid var(--color-mist)', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-graphite)', boxSizing: 'border-box' }}>
                        <option value="">Select experience</option>
                        <option value="<1">Less than 1 year</option>
                        <option value="1-3">1 – 3 years</option>
                        <option value="3-7">3 – 7 years</option>
                        <option value="7+">7+ years</option>
                      </select>
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: '6px', justifyContent: 'center' }}
                      onClick={() => {
                        if (!bizForm.company || !bizForm.email) return alert('Please fill Company Name and Email.');
                        setBizSubmitted(true);
                      }}>
                      Submit Empanelment Application →
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right: Why Partner + Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--color-ash)', borderRadius: 'var(--radius-cards)', padding: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '16px' }}>Why Join SuryaSetu's Network?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: <Star size={16} color="var(--color-ember-orange)" />, title: 'Pre-Qualified Leads', desc: 'Every consumer request includes an AI-generated system size, roof area, bill data, and subsidy calculation — zero cold calling.' },
                    { icon: <SealCheck size={16} color="var(--color-brass)" />, title: 'Trust Badge & Verification', desc: 'Your MNRE empanelment and certifications are displayed prominently to build immediate consumer confidence.' },
                    { icon: <BuildingsIcon size={16} color="#1d4ed8" />, title: 'Pan-India Reach', desc: 'Get discovered by consumers across all states where you operate through a centralized smart directory.' },
                    { icon: <Certificate size={16} color="#7c3aed" />, title: 'Compliance-First Platform', desc: 'Our platform enforces ALMM mandate, PM Surya Ghar compliance, and bid transparency across all marketplace interactions.' },
                  ].map(b => (
                    <div key={b.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', background: 'var(--color-canvas-white)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--color-mist)' }}>
                        {b.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-graphite)', marginBottom: '2px' }}>{b.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-steel)', lineHeight: 1.5 }}>{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empanelment Requirements */}
              <div style={{ background: 'var(--color-canvas-white)', border: '1px solid var(--color-mist)', borderRadius: 'var(--radius-cards)', padding: '24px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 400, color: 'var(--color-graphite)', marginBottom: '12px' }}>Empanelment Requirements</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-steel)' }}>
                  {[
                    'Valid MNRE or State Nodal Agency empanelment certificate',
                    'GST registration in operating states',
                    'Minimum 5-year O&M warranty capability',
                    'Use of ALMM-listed PV modules (mandatory for DBT subsidy)',
                    'Verified business address and contact details',
                  ].map((req, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <ArrowRight size={13} color="var(--color-ember-orange)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Quote Request Modal ── */}
        {showModal && selectedVendor && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 200 }}>
            <div style={{ background: 'var(--color-canvas-white)', borderRadius: 'var(--radius-cards)', padding: '32px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--color-mist)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-slate)', marginBottom: '4px' }}>Quote Request</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--color-graphite)', margin: 0 }}>{selectedVendor.companyName}</h3>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-slate)', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: 'var(--color-fog)', border: '1px solid var(--color-mist)', borderRadius: '8px', padding: '16px', fontSize: '13px', color: 'var(--color-steel)', whiteSpace: 'pre-wrap', lineHeight: 1.7, marginBottom: '20px' }}>
                {quoteText}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {
                  alert(`Quote request dispatched to ${selectedVendor.companyName}! You will receive a response at your registered email within 24–48 hours.`);
                  setShowModal(false);
                }}>
                  Send Quote Request →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

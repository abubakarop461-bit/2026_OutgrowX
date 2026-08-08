import React, { useState } from 'react';
import { Search, MapPin, Star, Filter, ShieldCheck, TrendingUp, Users, CheckCircle, Mail, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VendorMarketplace() {
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState<'find' | 'business'>('find');
  const [showModal, setShowModal] = useState(false);

  // Mock Vendor Data
  const vendors = [
    { id: 1, name: 'Solarworks India Pvt Ltd', rating: 4.8, reviews: 127, type: 'Installer', location: 'Maharashtra', specs: ['Residential', 'Subsidy Filing', 'Net Metering'], price: '₹₹' },
    { id: 2, name: 'GreenEnergy Solutions', rating: 4.5, reviews: 89, type: 'Installer', location: 'Maharashtra', specs: ['Commercial', 'Battery Storage'], price: '₹₹₹' },
    { id: 3, name: 'SunPower Tech', rating: 4.2, reviews: 45, type: 'Maintenance', location: 'Maharashtra', specs: ['Panel Cleaning', 'Inverter Repair'], price: '₹' },
    { id: 4, name: 'EcoSolar Systems', rating: 4.9, reviews: 210, type: 'Installer', location: 'Karnataka', specs: ['Residential', 'Off-grid'], price: '₹₹' },
  ];

  return (
    <main className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Solar Marketplace</h1>
        <p className="text-gray-400">Connect with top-rated solar installers and businesses.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-800 pb-px">
        <button 
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'find' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('find')}
        >
          Find Installers
        </button>
        <button 
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'business' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('business')}
        >
          Business Portal
        </button>
      </div>

      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-bg-surface border border-gray-700 rounded-lg px-3 py-2">
              <MapPin size={18} className="text-gray-400" />
              <select className="bg-transparent border-none outline-none text-sm text-white">
                <option>Maharashtra</option>
                <option>Karnataka</option>
                <option>Delhi</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-bg-surface border border-gray-700 rounded-lg px-3 py-2">
              <Filter size={18} className="text-gray-400" />
              <select className="bg-transparent border-none outline-none text-sm text-white">
                <option>All Types</option>
                <option>Installer</option>
                <option>Manufacturer</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-bg-surface border border-gray-700 rounded-lg px-3 py-2">
              <Star size={18} className="text-gray-400" />
              <select className="bg-transparent border-none outline-none text-sm text-white">
                <option>4+ Stars</option>
                <option>3+ Stars</option>
                <option>Any Rating</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-bg-surface border border-gray-700 rounded-lg px-3 py-2">
              <span className="text-gray-400 font-medium">₹</span>
              <select className="bg-transparent border-none outline-none text-sm text-white">
                <option>Any Price</option>
                <option>₹₹</option>
                <option>₹₹₹</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendors.map(v => (
              <div key={v.id} className="vendor-card glass-card p-5 rounded-2xl flex flex-col h-full border border-gray-800 hover:border-accent/50 transition-all">
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                    <Sun className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{v.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-medium">{v.rating}</span>
                      <span>({v.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4 space-y-2 flex-grow">
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-gray-500">Type:</span> {v.type} · {v.location}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Specializations:</span> {v.specs.join(' · ')}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                  <span className="font-medium text-gray-300">{v.price}</span>
                  <button 
                    className="btn btn-primary px-4 py-2 text-sm"
                    onClick={() => setShowModal(true)}
                  >
                    Get Quote →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="space-y-8">
          {/* Simple Dashboard View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-xl border-t-2 border-t-accent">
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

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xl font-semibold mb-2">Recent Leads</h3>
              
              {/* Lead Card */}
              <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-lg">Arjun Sharma</h4>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={14}/> Pune, Maharashtra</p>
                  <p className="text-sm mt-2">
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs mr-2">System: 4 kW</span>
                    <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs border border-green-800">Interest: High</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary px-3 py-1.5 text-sm">View Contact</button>
                  <button className="btn btn-primary px-3 py-1.5 text-sm">Mark Active</button>
                </div>
              </div>
              
              {/* Lead Card */}
              <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-lg">Priya Patel</h4>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={14}/> Mumbai, Maharashtra</p>
                  <p className="text-sm mt-2">
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs mr-2">System: 2.5 kW</span>
                    <span className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-800">Interest: Medium</span>
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
              <p className="text-sm text-gray-400 mb-6">Want to receive verified solar leads? Register your business on SuryX.</p>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block text-sm mb-1 text-gray-300">Company Name</label>
                  <input type="text" className="w-full bg-bg-surface border border-gray-700 rounded-lg px-3 py-2 text-white" placeholder="Solar Co." />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-300">GSTIN</label>
                  <input type="text" className="w-full bg-bg-surface border border-gray-700 rounded-lg px-3 py-2 text-white" placeholder="27XXXXX..." />
                </div>
                <button className="btn btn-primary w-full">Apply Now</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-gray-700 shadow-2xl">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2"><Mail className="text-accent" /> Draft Inquiry</h3>
            <p className="text-gray-400 mb-6 text-sm">We've pre-filled this based on your AI Solar Report.</p>
            
            <div className="bg-bg-surface/50 border border-gray-800 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                Hello,<br/><br/>
                I am interested in installing a solar system and would like a quote. Based on my SuryX AI assessment:<br/><br/>
                - Recommended Size: 3.5 kW<br/>
                - Roof Area: 800 sq ft<br/>
                - Current Monthly Bill: ₹3,200<br/>
                - Location: Maharashtra<br/><br/>
                Please let me know your pricing, brands used, and availability for a site survey.<br/><br/>
                Thanks,<br/>
                Arjun
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Send Inquiry</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

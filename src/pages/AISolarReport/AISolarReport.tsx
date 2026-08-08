import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Download, Sun, CheckCircle2, Star, Zap, Settings, ShieldCheck, Battery } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Stub imports — will be replaced when services are built
const useApp = () => ({ profile: { firstName: 'Arjun', state: 'Maharashtra', discom: 'MSEDCL', avgBill: 3200, roofSqFt: 800 }, language: 'en', isOnboarded: true, userRole: 'consumer', setProfile: () => {}, setLanguage: () => {}, completeOnboarding: () => {} });

export default function AISolarReport() {
  const { profile } = useApp();
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Chart Data
  const years = Array.from({ length: 26 }, (_, i) => i);
  const roiData = {
    labels: years,
    datasets: [
      {
        label: 'Cumulative Savings (₹)',
        data: years.map(year => {
          if (year === 0) return -162000;
          return -162000 + (year * 50000) * Math.pow(1.05, year); // escalating savings
        }),
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(168, 255, 62, 0.4)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)'); // red at bottom
          return gradient;
        },
        borderColor: '#A8FF3E',
        tension: 0.4,
      }
    ]
  };

  const yearlySavingsData = {
    labels: Array.from({ length: 25 }, (_, i) => `Y${i + 1}`),
    datasets: [
      {
        label: 'Annual Savings (₹)',
        data: Array.from({ length: 25 }, (_, i) => 52000 * Math.pow(1.03, i)),
        backgroundColor: '#4ADE80',
        borderRadius: 4,
      }
    ]
  };

  const roiOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `₹${context.raw.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: '#333' },
        ticks: { color: '#888' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#888' }
      }
    }
  };

  return (
    <main className="container mx-auto px-4 pt-20 pb-12">
      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white; color: black; }
          nav, .no-print { display: none !important; }
          .glass-card { background: white !important; border: 1px solid #ccc !important; box-shadow: none !important; color: black !important; }
          .text-primary, .text-gray-400 { color: black !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="model-badge bg-primary/20 text-accent px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-accent/30">
              <Sun size={14} /> Solar Intelligence ✦
            </span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-1">Your AI Solar Intelligence Report</h1>
          <p className="text-gray-400">Personalized for {profile.firstName} · {profile.state} · Generated {new Date().toLocaleDateString('en-IN')}</p>
        </div>
        <div className="flex gap-3 no-print">
          {!isGenerated && (
            <button 
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Analyzing Data...' : 'Generate Report'}
            </button>
          )}
          {isGenerated && (
            <button className="btn btn-secondary flex items-center gap-2" onClick={handlePrint}>
              <Download size={18} /> Export PDF
            </button>
          )}
        </div>
      </div>

      {!isGenerated ? (
        isGenerating ? (
          <div className="grid gap-6">
            <div className="skeleton h-32 rounded-xl"></div>
            <div className="skeleton h-96 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="skeleton h-64 rounded-xl"></div>
              <div className="skeleton h-64 rounded-xl"></div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-600 rounded-2xl h-96">
            <Sun className="text-accent mb-4" size={48} />
            <h2 className="text-2xl font-semibold mb-2">Ready to discover your solar potential?</h2>
            <p className="text-gray-400 max-w-md mb-6">Our AI will analyze your roof size, location, and energy profile to generate a customized 25-year projection.</p>
            <button className="btn btn-primary text-lg px-8 py-3" onClick={handleGenerate}>Generate Report Now</button>
          </div>
        )
      ) : (
        <div className="space-y-8 animate-fade-in">
          
          {/* Section 1 - Exec Summary */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-xl text-center">
              <p className="text-sm text-gray-400 mb-1">Recommended System</p>
              <p className="text-2xl font-bold text-accent">3.5 kW</p>
            </div>
            <div className="glass-card p-5 rounded-xl text-center">
              <p className="text-sm text-gray-400 mb-1">Annual Savings</p>
              <p className="text-2xl font-bold text-accent">₹52,000</p>
            </div>
            <div className="glass-card p-5 rounded-xl text-center">
              <p className="text-sm text-gray-400 mb-1">Payback Period</p>
              <p className="text-2xl font-bold text-accent">4.2 years</p>
            </div>
            <div className="glass-card p-5 rounded-xl text-center bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
              <p className="text-sm text-gray-400 mb-1">Solar Score</p>
              <p className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                89/100 <Zap size={20} />
              </p>
            </div>
          </section>

          {/* Section 2 & 3 Charts */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">25-Year ROI Projection</h3>
              <div className="h-64 mb-4">
                <Line data={roiData} options={roiOptions} />
              </div>
              <p className="text-center text-sm text-gray-400">
                <strong className="text-white">₹16.2L</strong> total savings over 25 years · <strong className="text-white">₹1.05L</strong> annual average
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Yearly Savings Breakdown</h3>
              <div className="h-64 mb-4">
                <Bar data={yearlySavingsData} options={roiOptions} />
              </div>
              <p className="text-center text-sm text-gray-400">
                Accounts for 3% annual grid tariff escalation
              </p>
            </div>
          </section>

          {/* Section 4 - System Config */}
          <section className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Settings className="text-accent" /> System Configuration
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-bg-surface/50 rounded-lg border border-gray-800">
                <Sun className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Solar Panels</p>
                <p className="font-medium">9 × 390W Monocrystalline (Tier 1)</p>
              </div>
              <div className="p-4 bg-bg-surface/50 rounded-lg border border-gray-800">
                <Zap className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Inverter</p>
                <p className="font-medium">3.5 kW String Inverter</p>
              </div>
              <div className="p-4 bg-bg-surface/50 rounded-lg border border-gray-800">
                <Settings className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Mounting</p>
                <p className="font-medium">Rooftop fixed tilt</p>
              </div>
              <div className="p-4 bg-bg-surface/50 rounded-lg border border-gray-800">
                <Battery className="text-gray-400 mb-2" size={20} />
                <p className="text-sm text-gray-400">Battery (Optional)</p>
                <p className="font-medium">5 kWh LFP</p>
              </div>
            </div>
            <p className="mt-4 text-center font-medium text-accent">Estimated Annual Generation: 14,400 kWh</p>
          </section>

          {/* Section 6 - Gov Schemes */}
          <section className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-accent" /> Government Schemes & Subsidies
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-3 px-4 font-semibold">Scheme</th>
                    <th className="py-3 px-4 font-semibold">Eligibility</th>
                    <th className="py-3 px-4 font-semibold">Estimated Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-4">PM Surya Ghar: Muft Bijli Yojana</td>
                    <td className="py-3 px-4 text-accent flex items-center gap-1"><CheckCircle2 size={16} /> Yes</td>
                    <td className="py-3 px-4 font-medium">₹78,000 subsidy</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-4">DISCOM Net Metering</td>
                    <td className="py-3 px-4 text-accent flex items-center gap-1"><CheckCircle2 size={16} /> Yes</td>
                    <td className="py-3 px-4 font-medium">Export credits</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7 - Vendors */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Top 3 Vendor Matches</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="vendor-card glass-card p-5 rounded-xl border border-gray-800 hover:border-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                      <Sun size={20} className="text-accent" />
                    </div>
                    <div className="flex items-center gap-1 text-sm bg-gray-800 px-2 py-1 rounded">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.{9-i}
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">SolarWorks {profile.state} {i}</h4>
                  <p className="text-sm text-gray-400 mb-4">Certified Installer</p>
                  <button className="btn btn-secondary w-full">Get Quote</button>
                </div>
              ))}
            </div>
          </section>

          {/* Section 8 - Next Steps */}
          <section className="glass-card p-6 rounded-2xl border-l-4 border-l-accent">
            <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
            <div className="space-y-3">
              {[
                "Book a free site survey with matched vendors",
                "Apply for PM Surya Ghar subsidy online",
                "Compare quotes and finalize installation",
                "Submit DISCOM net-metering application",
                "Schedule installation and go green!"
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}
    </main>
  );
}

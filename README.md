# 🌞 SuryaSetu — Solar Intelligence Platform
> **Project 2026_OutgrowX** | India's AI-Powered Solar ROI & Decision Engine

SuryaSetu is an intelligent solar energy decision & marketplace platform designed for Indian homeowners, landowners, and solar installers. It pairs 20-year backdated state electricity board tariff data with multi-tier AI vision and reasoning models to deliver instant bill parsing, precise ROI forecasting, seasonal consumption modeling, and seamless vendor matching.

---

## 🚀 Key Features

- 🏠 **3-Role Experience**: Customized user flows for **Consumers** (homeowners/tenants), **Landowners** (utility-scale land solar under PM-KUSUM), and **Solar Businesses** (installer lead marketplace).
- 📋 **5-Step Onboarding**: Identity, property type, monthly bill, current solar setup, and state/city with auto-assigned DISCOM detection (MSEDCL, BESCOM, TANGEDCO, UPPCL, etc.).
- 📊 **Dynamic Dashboard**:
  - **20-Year ROI Chart**: Interactive Chart.js area chart comparing 20-year cumulative grid cost vs. solar savings (10yr / 20yr / 25yr toggles).
  - **Solar Score**: 0–100 suitability rating calculated across 5 dimensions with animated horizontal score bars.
  - **KPI Cards**: Live count-up animations for Monthly Savings, Payback Period, System Sizing (kW), and Subsidy Eligibility.
  - **Daily AI Insight**: Context-rich tips streamed via custom AI endpoints.
- 🔍 **Solar AI Hub**:
  - **Bill OCR Scanner**: Upload physical electricity bill images for instant extraction of DISCOM name, consumer number, units consumed, and bill amount.
  - **Appliance Calculator**: Model 12 appliance categories with seasonal sliders (Summer, Monsoon, Winter) to generate stacked seasonal bar charts and category pie charts.
  - **AI Advisor Chat**: Regional solar expert trained on Indian tariffs, PM Surya Ghar, and MNRE policies with streaming text responses and generic model fallback badges.
- 📐 **Property Assessment**:
  - **Roof Solar Analysis**: Orientation compass, shading impact, building age → 4-subscore evaluation + 24×12 hour-month solar irradiance heatmap.
  - **Land Solar Potential**: Assess unused land acreage, terrain, and soil to forecast annual energy generation and revenue under PM-KUSUM Component A.
- 📑 **AI Solar Report**: 8-section comprehensive report with 25-year ROI area projection, yearly savings bar chart, system configuration, government scheme table, and PDF export (`window.print()`).
- 🏪 **Vendor Marketplace**: Consumer installer search with state/type/rating filters + installer lead management portal.
- 🌐 **Multilingual Support**: English, हिंदी, and मराठी language switcher in the sticky glass navbar.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS with glassmorphic tokens & React Bits static dot-grid background (`#070D09` dark theme, `#A8FF3E` electric green accents)
- **Data Visualization**: Chart.js (`react-chartjs-2`)
- **Maps**: Leaflet.js & OpenStreetMap (Free, no billing required)
- **Routing & Icons**: React Router v6, Lucide React
- **AI Models**: Custom OpenAI-compatible API endpoint with multi-tier model chaining:
  - Primary Chat & Reasoning: `auto/best-reasoning` / `auto/fast`
  - Bill Vision OCR: `auto/best-vision` → Gemini Vision → Nemotron
  - Model Branding: Generic labeling (`Solar Pro Advisor`, `Solar Vision AI`, `Solar Basic Advisor`)

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/abubakarop461-bit/2026_OutgrowX.git
cd 2026_OutgrowX

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
VITE_OMNI_API_BASE=https://nations-endif-islands-commercial.trycloudflare.com/v1
VITE_OMNI_API_KEY=sk-suryx-custom-key

# 4. Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 📦 Production Build

```bash
npm run build
```

---

## 📜 License

MIT License. Developed for OutgrowX 2026.

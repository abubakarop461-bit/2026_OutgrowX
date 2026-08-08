import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, UserRole } from '../../context/AppContext';
import {
  House, Plant, Buildings, Sun, Lightning, ChartBar, Receipt, MapPin, Storefront, ArrowRight, CheckCircle, Globe
} from '@phosphor-icons/react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole, isAuthenticated, language } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      navigate('/onboarding');
    }
  };

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const strings = {
    heroTitle: isHi ? "भारत का सौर इंटेलिजेंस ऑब्जर्वेटरी।" : isMr ? "भारताची सोलर इंटेलिजन्स ऑब्झर्व्हेटरी." : "India's Solar Intelligence Observatory.",
    heroDesc: isHi 
      ? "त्वरित बिल विश्लेषण, 25-वर्षीय वित्तीय बचत, डिस्कॉम नेट-मीटरिंग नियम और पीएम सूर्य घर सब्सिडी एक केंद्रीकृत संदर्भ इंजन के तहत एकीकृत।" 
      : isMr 
        ? "त्वरित बिल विश्लेषण, 25-वर्षांचे आरओआय मॉडेलिंग, डिस्कॉम नेट-मीटरिंग नियम आणि पीएम सूर्य घर अनुदान एकाच केंद्रीकृत संदर्भ प्रणाली अंतर्गत एकत्रित." 
        : "Instant bill parsing, 25-year ROI modeling, DISCOM net-metering rules, and PM Surya Ghar subsidies unified under a Centralized Context Engine.",
    startAssessment: isHi ? "नि:शुल्क मूल्यांकन शुरू करें →" : isMr ? "मोफत मूल्यांकन सुरू करा →" : "Start Free Assessment →",
    forBusinesses: isHi ? "सौर व्यवसायों के लिए" : isMr ? "सोलर व्यवसायांसाठी" : "For Solar Businesses",
    selectPathway: isHi ? "अपने मार्ग का चयन करें" : isMr ? "तुमचा पर्याय निवडा" : "Select Your Pathway",
    trustedDesc: isHi ? "भारत भर में 80+ डिस्कॉम फ्रेमवर्क और इंस्टॉलरों द्वारा विश्वसनीय" : isMr ? "भारतभरातील ८०+ डिस्कॉम फ्रेमवर्क आणि सोलर इंस्टॉलर्सद्वारे विश्वसनीय" : "Trusted by 80+ DISCOM frameworks & installers across India",
    
    // Roles
    consumerTitle: isHi ? "मुझे सोलर चाहिए" : isMr ? "मला सोलर हवे आहे" : "I Want Solar",
    consumerDesc: isHi 
      ? "25-वर्षीय आरओआई की गणना करें, एआई के साथ अपने बिजली बिल को स्कैन करें, और प्रमाणित इंस्टॉलरों से जुड़ें।" 
      : isMr 
        ? "25-वर्षांच्या परताव्याची गणना करा, एआय सह तुमचे वीज बिल स्कॅन करा आणि प्रमाणित इंस्टॉलर्सशी संपर्क साधा." 
        : "Calculate 25-year ROI, scan your electricity bill with AI, and connect with empanelled installers.",
    consumerCta: isHi ? "मेरे सौर की गणना करें" : isMr ? "माझ्या सोलरची गणना करा" : "Calculate My Solar",

    landownerTitle: isHi ? "मेरे पास खाली भूमि है" : isMr ? "माझ्याकडे रिकामी जमीन आहे" : "I Have Unused Land",
    landownerDesc: isHi 
      ? "अपनी भूमि की सौर उत्पादन क्षमता, वार्षिक पट्टा राजस्व और पीएम-कुसुम पात्रता का मूल्यांकन करें।" 
      : isMr 
        ? "तुमच्या जमिनीची सोलर निर्मिती क्षमता, वार्षिक भाडेतत्व उत्पन्न आणि पीएम-कुसुम पात्रतेचे मूल्यांकन करा." 
        : "Evaluate your land's solar generation potential, annual lease revenue, and PM-KUSUM eligibility.",
    landownerCta: isHi ? "मेरी भूमि का विश्लेषण करें" : isMr ? "माझ्या जमिनीचे विश्लेषण करा" : "Analyze My Land",

    businessTitle: isHi ? "मैं एक सौर व्यवसाय हूँ" : isMr ? "मी सोलर व्यावसायिक आहे" : "I'm a Solar Business",
    businessDesc: isHi 
      ? "अपने राज्य में सत्यापित आवासीय और वाणिज्यिक सौर लीड प्राप्त करने के लिए हमारे बाजार में शामिल हों।" 
      : isMr 
        ? "तुमच्या राज्यातील सत्यापित घरगुती आणि व्यावसायिक सोलर ग्राहक मिळवण्यासाठी आमच्या बाजारात सामील व्हा." 
        : "Join our marketplace to receive qualified residential and commercial solar leads in your state.",
    businessCta: isHi ? "मार्केटप्लेस में शामिल हों" : isMr ? "मार्केटप्लेसमध्ये सामील व्हा" : "Join Marketplace",

    // Features
    aiScore: isHi ? "एआई सोलर स्कोर" : isMr ? "एआय सोलर स्कोर" : "AI Solar Score",
    subsidies: isHi ? "सरकारी सब्सिडी" : isMr ? "शासकीय अनुदान" : "Govt Subsidies",
    roiCalc: isHi ? "आरओआई कैलकुलेटर" : isMr ? "आरओआय कॅल्क्युलेटर" : "ROI Calculator",
    scanner: isHi ? "बिल स्कैनर" : isMr ? "बिल स्कॅनर" : "Bill Scanner",
    landAnalysis: isHi ? "भूमि विश्लेषण" : isMr ? "जमीन विश्लेषण" : "Land Analysis",
    marketplace: isHi ? "वेंडर मार्केटप्लेस" : isMr ? "वेंडर मार्केटप्लेस" : "Vendor Marketplace",

    // Badges
    badge1: isHi ? "28 राज्य और केंद्र शासित प्रदेश" : isMr ? "२८ राज्ये आणि केंद्रशासित प्रदेश" : "28 States & UTs Covered",
    badge2: isHi ? "पीएम सूर्य घर 2024 तैयार" : isMr ? "पीएम सूर्य घर २०२४ तयार" : "PM Surya Ghar 2024 Ready",
    badge3: isHi ? "एआई मॉडल चेन संचालित" : isMr ? "एआय मॉडेल चेन संचालित" : "AI Model Chain Powered",
  };

  const roles = [
    {
      role: 'consumer' as UserRole,
      Icon: House,
      title: strings.consumerTitle,
      desc: strings.consumerDesc,
      cta: strings.consumerCta,
      isPrimary: true,
    },
    {
      role: 'landowner' as UserRole,
      Icon: Plant,
      title: strings.landownerTitle,
      desc: strings.landownerDesc,
      cta: strings.landownerCta,
      isPrimary: false,
    },
    {
      role: 'business' as UserRole,
      Icon: Buildings,
      title: strings.businessTitle,
      desc: strings.businessDesc,
      cta: strings.businessCta,
      isPrimary: false,
    },
  ];

  const features = [
    { Icon: Sun,        label: strings.aiScore },
    { Icon: Lightning,  label: strings.subsidies },
    { Icon: ChartBar,   label: strings.roiCalc },
    { Icon: Receipt,    label: strings.scanner },
    { Icon: MapPin,     label: strings.landAnalysis },
    { Icon: Storefront, label: strings.marketplace },
  ];

  const statBadges = [
    strings.badge1,
    strings.badge2,
    strings.badge3
  ];

  return (
    <main
      style={{
        background: 'var(--color-canvas-white)',
        minHeight: '100vh',
        padding: '36px 24px 80px',
        color: 'var(--color-graphite)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <img
            src="/logo.png"
            alt="SuryaSetu Logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, letterSpacing: '-0.02em' }}>
            Surya<span style={{ color: 'var(--color-ember-orange)' }}>Setu</span>
          </span>
        </div>

        {/* Hero Headline Block */}
        <section style={{ marginBottom: '60px', maxWidth: '800px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '-1.32px',
              color: 'var(--color-graphite)',
              marginBottom: '20px',
            }}
          >
            {strings.heroTitle}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.4,
              color: 'var(--color-steel)',
              marginBottom: '32px',
              maxWidth: '640px',
            }}
          >
            {strings.heroDesc}
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleRoleSelect('consumer')}
            >
              {strings.startAssessment}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => handleRoleSelect('business')}
            >
              {strings.forBusinesses}
            </button>
          </div>
        </section>

        {/* Role Cards */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-brass)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            {strings.selectPathway}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {roles.map(({ role, Icon, title, desc, cta, isPrimary }) => (
              <div
                key={role}
                style={{
                  background: isPrimary ? 'var(--color-ash)' : 'var(--color-fog)',
                  borderRadius: '6px 0px 0px 6px',
                  padding: '40px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: isPrimary ? '1px solid var(--color-mist)' : '1px solid transparent',
                  transition: 'all 150ms ease',
                }}
                onClick={() => handleRoleSelect(role)}
              >
                <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--color-ember-orange)' }}>
                  <Icon size={28} weight="regular" />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-graphite)',
                    marginBottom: '10px',
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-steel)',
                    lineHeight: 1.6,
                    marginBottom: '28px',
                    flex: 1,
                  }}
                >
                  {desc}
                </p>

                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      color: 'var(--color-graphite)',
                      textDecoration: 'underline',
                      textDecorationColor: 'var(--color-ember-orange)',
                      textUnderlineOffset: '3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {cta} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Observatory Strip */}
        <section
          style={{
            padding: '24px 0',
            borderTop: '1px solid var(--color-mist)',
            borderBottom: '1px solid var(--color-mist)',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'space-between', alignItems: 'center' }}>
            {features.map(({ Icon, label }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-steel)' }}>
                <Icon size={16} color="var(--color-ember-orange)" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Partner / Coverage Strip */}
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-brass)', letterSpacing: '-0.02em' }}>
            {strings.trustedDesc}
          </span>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {statBadges.map((badge, i) => (
              <span key={i} className="badge">
                {badge}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Landing;

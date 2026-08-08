// SuryX Solar Blog Feed & Knowledge Base Service

export interface BlogArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
  imageUrl?: string;
}

export const FEED_SOURCES = [
  "https://www.solarsquare.in/blog/feed",
  "https://www.eqmagpro.com/feed",
  "https://usolar.in/feed",
  "https://www.pv-magazine-india.com/feed",
  "https://www.itsmysun.com/feed",
  "https://blog.solarclue.com/feed"
];

// Seeded articles for instant access, fail-safety, and AI knowledge base injection
export const STATIC_FALLBACK_BLOGS: BlogArticle[] = [
  {
    title: "PM Surya Ghar Muft Bijli Yojana: A Complete 2026 Subsidy Guide",
    link: "https://www.solarsquare.in/blog/pm-surya-ghar-muft-bijli-yojana/",
    source: "SolarSquare",
    pubDate: "2026-07-20",
    description: "Learn how the PM Surya Ghar scheme offers up to ₹78,000 in direct bank transfers for residential rooftop installations up to 3kW.",
  },
  {
    title: "Nagpur TOPCon Cell Factory Phase-1 Operationalized by Avaada",
    link: "https://www.pv-magazine-india.com/2026/08/avaada-operationalizes- Nagpur-topcon-cell-factory/",
    source: "PV Magazine India",
    pubDate: "2026-08-01",
    description: "Avaada Electro starts production at its 3 GW phase of the 6 GW TOPCon solar cell plant in Maharashtra, boosting domestic manufacturing.",
  },
  {
    title: "Floating Solar Milestone: PM Surya Sarovar Yojana Targets 5 GW",
    link: "https://www.eqmagpro.com/india-launches-pm-surya-sarovar-yojana-floating-solar/",
    source: "EQ International",
    pubDate: "2026-07-28",
    description: "The Indian government launches the PM-SSY scheme to deploy 5 GW of floating solar PV paired with grid energy storage.",
  },
  {
    title: "Solar for Apartment Complexes: Overcoming RWA and Metering Roadblocks",
    link: "https://www.solarsquare.in/blog/solar-for-apartments-guide/",
    source: "SolarSquare",
    pubDate: "2026-06-15",
    description: "How RWAs can manage shared solar rooftops, common area power utility distribution, and apply virtual net metering.",
  },
  {
    title: "Domestic Solar Glass Capacity Reaches 2.5 GW with Rajasthan Facility Startup",
    link: "https://www.pv-magazine-india.com/2026/08/rajasthan-solar-glass-factory/",
    source: "PV Magazine India",
    pubDate: "2026-08-05",
    description: "Emerge Renewables starts up a state-of-the-art solar glass factory in Rajasthan, reducing dependence on imports.",
  },
  {
    title: "Understanding Grid Curtailment and Transmission Issues in Rajasthan and Gujarat",
    link: "https://usolar.in/blog/understanding-grid-curtailment-india/",
    source: "USolar",
    pubDate: "2026-08-02",
    description: "An analysis of transmission bottlenecks affecting one-third of newly commissioned large-scale solar projects in western India.",
  },
  {
    title: "How to Choose the Right Solar Inverter: Micro vs. String vs. Hybrid",
    link: "https://www.itsmysun.com/blog/solar-inverter-comparison/",
    source: "ItsMySun",
    pubDate: "2026-05-10",
    description: "A practical guide for Indian homeowners to select inverters based on local grid reliability and battery backup needs.",
  },
  {
    title: "Net Metering Regulations Across States: MSEDCL vs. UGVCL vs. BESCOM",
    link: "https://blog.solarclue.com/state-net-metering-policies-india/",
    source: "SolarClue",
    pubDate: "2026-07-12",
    description: "A comparison of state solar billing, export credit rates, and application timelines for net metering.",
  },
  {
    title: "Solar Module Maintenance: Cleaning Frequencies and Dust Mitigation in India",
    link: "https://usolar.in/blog/solar-panel-cleaning-tips/",
    source: "USolar",
    pubDate: "2026-04-22",
    description: "How frequent soil accretion reduces generation by up to 15% and best practices for waterless cleaning.",
  },
  {
    title: "PM-KUSUM Component A: Opportunities for Landowners in Maharashtra",
    link: "https://blog.solarclue.com/pm-kusum-landowner-income-guide/",
    source: "SolarClue",
    pubDate: "2026-06-30",
    description: "How farmers and rural landowners can lease unused dry land for developers to build 500kW to 2MW grid-tied solar plants.",
  }
];

/**
 * Fetch RSS feeds using a CORS proxy and parse them.
 * Gracefully falls back to static seed blogs if network fails or feeds are blocked.
 */
export async function fetchFeedBlogs(): Promise<BlogArticle[]> {
  try {
    const fetchPromises = FEED_SOURCES.map(async (feedUrl) => {
      // Use public AllOrigins CORS proxy to fetch the RSS XML feed
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Failed to fetch feed: ${feedUrl}`);
      const json = await res.json();
      const xmlString = json.contents;
      
      // Parse XML response in browser environment
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const items = xmlDoc.querySelectorAll("item");
      
      const articles: BlogArticle[] = [];
      const sourceName = new URL(feedUrl).hostname.replace("www.", "").split(".")[0];
      const sourceLabel = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);
      
      items.forEach((item) => {
        const title = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const descriptionRaw = item.querySelector("description")?.textContent || "";
        
        // Strip HTML tags from description
        const description = descriptionRaw.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 140) + "...";
        
        if (title && link) {
          articles.push({
            title,
            link,
            source: sourceLabel,
            pubDate: pubDate ? new Date(pubDate).toLocaleDateString() : "",
            description
          });
        }
      });
      return articles.slice(0, 4); // Limit to top 4 items per feed
    });

    const results = await Promise.allSettled(fetchPromises);
    const fetchedArticles: BlogArticle[] = [];
    
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        fetchedArticles.push(...result.value);
      }
    });

    if (fetchedArticles.length > 0) {
      // Shuffle & randomize articles
      return fetchedArticles.sort(() => Math.random() - 0.5);
    }
  } catch (error) {
    console.warn("Failed to fetch live RSS feeds, falling back to static blogs:", error);
  }
  
  // Return shuffled static fallback list
  return [...STATIC_FALLBACK_BLOGS].sort(() => Math.random() - 0.5);
}

/**
 * Builds a string summarizing these articles to serve as a context-injected knowledge base
 */
export function getKnowledgeBasePrompt(articles: BlogArticle[]): string {
  const list = articles.slice(0, 8).map((art, idx) => {
    return `${idx + 1}. [${art.source}] ${art.title} - ${art.description}`;
  }).join("\n");
  
  return `
LATEST INDIAN SOLAR POLICY & INDUSTRY HEADLINES (KNOWLEDGE BASE):
Use the following information to answer regional questions and reference current schemes:
${list}
`;
}

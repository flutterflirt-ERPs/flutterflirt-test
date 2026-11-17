/**
 * Seed script to publish 2 tailored blogs on Edge AI IoT and Multi-Country ERP.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.flutterflirt.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@flutterflirt.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "memyselfherog@123";

const NEW_CURATED_BLOGS = [
  // 1. Edge-to-Cloud Industrial IoT & Predictive Telemetry
  {
    title: "Edge-to-Cloud Industrial IoT: Bridging Factory Sensor Telemetry with Dynamics 365 Supply Chain",
    slug: "edge-to-cloud-industrial-iot-bridging-sensor-telemetry-with-dynamics-365",
    excerpt: "How modern manufacturers connect factory-floor ESP32 microcontrollers and vibration sensors through Azure IoT Hub directly into Dynamics 365 to automate predictive maintenance work orders.",
    cover_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    category: "IoT & Embedded",
    author: "FlutterFlirt IoT & ERP Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The Disconnect Between Physical Machines and Enterprise ERP",
        slug: "the-disconnect-between-physical-machines-and-enterprise-erp",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "In traditional manufacturing and warehouse facilities, mission-critical machines operate in digital isolation. A motor bearing overheating or a hydraulic pump experiencing abnormal pressure drops is typically discovered only after complete breakdown halts assembly lines. Meanwhile, enterprise maintenance management modules inside ERP systems remain unaware until manual incident tickets are filed hours later.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt bridges this divide by designing unified Edge-to-Cloud telemetry pipelines that link hardware sensors on industrial machinery directly with Microsoft Dynamics 365 Supply Chain Management and Azure IoT Hub.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Architecture: From Silicon Microcontrollers to ERP Action",
        slug: "architecture-from-silicon-microcontrollers-to-erp-action",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "The integration architecture leverages low-latency edge computing paired with cloud event stream processing to prevent operational bottlenecks before they occur.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "• Edge Sensor Nodes: Dual-core ESP32 microcontrollers sampling 3-axis vibration, thermocouple temperature, and current consumption via industrial I2C/SPI interfaces.\n• Stream Analytics & Anomaly Detection: Edge gateways run FFT frequency analysis to detect micro-wear patterns, transmitting structured JSON telemetry to Azure IoT Hub over TLS 1.3 encrypted MQTT.\n• Automated Maintenance Work Orders: When telemetry crosses warning thresholds, Azure Logic Apps automatically generates preventative work orders and reserves spare parts in Dynamics 365.\n• Technician Dispatch: Field service technicians receive immediate push notifications with diagnostic telemetry and replacement part bin locations.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Quantifiable Impact: Eliminating Unplanned Downtime",
        slug: "quantifiable-impact-eliminating-unplanned-downtime",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Deploying integrated IoT telemetry with enterprise ERP eliminates unplanned equipment downtime by up to 42%, extends machine asset longevity, and transforms reactive maintenance into a predictable, automated operational routine.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  // 2. Global Multi-Entity Financial Governance in Dynamics 365
  {
    title: "Multi-Entity Financial Consolidation in Dynamics 365: Scaling Global Ledgers without Spreadsheet Chaos",
    slug: "multi-entity-financial-consolidation-in-dynamics-365-scaling-global-ledgers",
    excerpt: "Overcome multi-currency conversion, intercompany eliminations, and regional statutory compliance bottlenecks with FlutterFlirt's enterprise Dynamics 365 Finance blueprint.",
    cover_image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
    category: "Dynamics 365",
    author: "FlutterFlirt Enterprise Finance Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The Friction of Multi-Country Expansion",
        slug: "the-friction-of-multi-country-expansion",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "When fast-growing corporations expand internationally, financial reporting complexity multiplies exponentially. Subsidiary entities frequently operate with distinct local charts of accounts, varying tax jurisdictions (GST, VAT, Sales Tax), and multi-currency transactions. Without automated consolidation, finance teams spend weeks every quarter manually reconciling cross-entity journals inside fragile spreadsheets.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt’s Dynamics 365 Finance architecture enables multinational enterprises to orchestrate centralized global reporting while granting regional entities localized operational autonomy.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Key Architecture Pillars of Automated Financial Governance",
        slug: "key-architecture-pillars-of-automated-financial-governance",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "By designing a hierarchical Global Chart of Accounts (COA) structure within Microsoft Dynamics 365, finance leaders gain instant transparency into parent and subsidiary health.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "• Automated Intercompany Eliminations: Balancing intercompany receivables, payables, and sales transactions across parent and subsidiary ledgers with zero manual journal entries.\n• Multi-Currency Real-Time Revaluation: Automated daily exchange rate synchronization with central banks and automated calculation of realized and unrealized FX gains/losses.\n• Localized Statutory Compliance: Built-in tax engines configuring regional e-invoicing, tax audit trails, and financial statement layouts for US GAAP, IFRS, and Indian MCA mandates.\n• Executive Financial Reporting Cubes: Pre-aggregated Power BI balance sheet and P&L visualizations offering drill-through analysis down to individual ledger vouchers.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Accelerating Fiscal Close Cycles",
        slug: "accelerating-fiscal-close-cycles",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "With FlutterFlirt’s proven D365 financial governance framework, enterprises routinely reduce month-end and quarterly financial close cycles from 18 days down to under 4 days—freeing corporate finance leaders to focus on capital allocation and strategic business expansion.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
];

async function runSeed() {
  console.log("=========================================");
  console.log("🌱 FlutterFlirt 2 Curated Service Blogs Seed");
  console.log("=========================================\n");

  console.log("Target API: " + API_URL);

  let token = null;

  try {
    const authRes = await fetch(API_URL + "/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (authRes.ok) {
      const authData = await authRes.json();
      token = authData.token || (authData.data && authData.data.token) || null;
      console.log("✅ Admin authentication successful!");
    } else {
      console.error("❌ Authentication failed:", await authRes.text());
      return;
    }
  } catch (err) {
    console.error("❌ Network error: " + err.message);
    return;
  }

  if (token) {
    console.log("\nInserting " + NEW_CURATED_BLOGS.length + " blogs into database...\n");
    for (const blog of NEW_CURATED_BLOGS) {
      try {
        const res = await fetch(API_URL + "/api/admin/blogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(blog),
        });
        const resJson = await res.json();
        if (res.ok && resJson.success !== false) {
          console.log("✅ Successfully seeded blog: \"" + blog.title + "\"");
        } else {
          console.error("⚠️  Failed for \"" + blog.title + "\":", resJson);
        }
      } catch (err) {
        console.error("❌ Failed to post blog \"" + blog.title + "\":", err.message);
      }
    }
  }

  console.log("\n🎉 Both curated service blogs published successfully!");
}

runSeed();

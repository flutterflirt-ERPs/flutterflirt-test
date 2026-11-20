/**
 * Seed script to publish 2 new enterprise technology blogs:
 * 1. Predictive Maintenance in Dynamics 365 Supply Chain & IoT
 * 2. Automated Financial Ledger Reconciliation & Accelerated Month-End Close in Business Central
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.flutterflirt.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@flutterflirt.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "memyselfherog@123";

const NEW_TWO_BLOGS = [
  // 1. Predictive Maintenance & IoT Asset Telemetry
  {
    title: "Predictive Maintenance in Action: Bridging Industrial IoT Telemetry with Dynamics 365 Supply Chain",
    slug: "predictive-maintenance-industrial-iot-dynamics-365-supply-chain",
    excerpt: "Discover how manufacturing and logistics enterprises connect machine vibration, heat sensors, and Azure IoT Hub directly into Dynamics 365 to eliminate unplanned downtime.",
    cover_image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80",
    category: "Dynamics 365 & IoT",
    author: "FlutterFlirt Industrial IoT Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "From Reactive Firefighting to Predictive Asset Health",
        slug: "from-reactive-to-predictive-asset-health",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "In manufacturing, packaging, and heavy machinery operations, an unexpected equipment failure doesn't just stop a single machine—it causes a catastrophic ripple effect across procurement, warehouse staging, and customer commitments. Traditional preventative maintenance relies on static calendar intervals, often servicing healthy machines while missing sudden micro-stresses.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt architects end-to-end predictive maintenance architectures connecting edge sensor telemetry directly to Microsoft Dynamics 365 Supply Chain Management. By continuously monitoring vibration, motor temperature, and operating pressure, anomalies trigger proactive maintenance work orders before physical wear causes catastrophic downtime.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Architecture: Azure IoT Hub, Stream Analytics, and Dynamics 365 Asset Management",
        slug: "architecture-iot-hub-stream-analytics-asset-management",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "The telemetry pipeline is built for high volume and millisecond responsiveness. Microcontrollers and industrial gateways ingest machine data over MQTT or OPC-UA protocols into Azure IoT Hub. Azure Stream Analytics continuously evaluates time-series window queries against established tolerance thresholds.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "When sensor values deviate from the baseline, an automated event is dispatched via Azure Event Grid into Dynamics 365 Asset Management. The system immediately schedules certified technicians, checks spare parts availability in the warehouse, and reserves replacement components in the central ERP inventory.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Quantifiable Impact: Slashing Unplanned Downtime and Spares Inventory Costs",
        slug: "quantifiable-impact-slashing-downtime-and-spares-costs",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Enterprises adopting FlutterFlirt's predictive IoT architecture consistently achieve up to a 42% reduction in unplanned downtime and an 18% reduction in carrying costs for spare parts. Technicians arrive with the exact tools and diagnostic blueprints required for the specific fault, boosting first-time fix rates above 90%.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Connecting physical factory floors with enterprise ledger and resource planning transforms maintenance from a reactive cost center into a strategic driver of predictable operational throughput.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  // 2. Automated Financial Ledger Reconciliation
  {
    title: "Accelerating the Financial Close: Automating Multi-Entity Ledger Reconciliation in Dynamics 365 Business Central",
    slug: "accelerating-financial-close-automating-ledger-reconciliation-business-central",
    excerpt: "How modern finance leaders cut monthly close cycles from 12 days to 48 hours with automated bank feeds, AI invoice matching, and intercompany elimination ledgers.",
    cover_image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80",
    category: "Finance & ERP",
    author: "FlutterFlirt Financial Systems Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The High Cost of Spreadsheet-Driven Month-End Closes",
        slug: "high-cost-of-spreadsheet-month-end-closes",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "For mid-market and enterprise organizations operating multiple subsidiaries, the monthly financial close is frequently a marathon of manual data exports, disjointed CSV spreadsheets, and grueling cross-ledger reconciliation. Discrepancies between bank statements, sub-ledgers, and intercompany charges create audit bottlenecks that delay executive decision-making.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Modernizing financial operations within Microsoft Dynamics 365 Business Central enables organizations to transform closing from a chaotic monthly sprint into a continuous, real-time accounting workflow.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Automated Bank Reconciliations and Rule-Based Clearing",
        slug: "automated-bank-reconciliations-rule-based-clearing",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt configures direct open banking APIs and Yodlee/Envestnet feeds that stream statement lines directly into Business Central every morning. Intelligent matching algorithms automatically reconcile 85%+ of recurring payments, vendor clearing, and merchant gateway deposits based on transaction reference, amount tolerances, and date proximity.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Finance teams only intervene for true exceptions, freeing controllers from manual data entry to focus on high-value variance analysis and working capital forecasting.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Seamless Intercompany Elimination and Consolidated Reporting",
        slug: "intercompany-elimination-consolidated-reporting",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Operating across multiple regions often requires complex intercompany purchase orders, management fees, and cross-entity journal allocations. Business Central’s automated Intercompany Outbox/Inbox processes transfer transactions between partner companies seamlessly, ensuring debit and credit parity across subsidiaries.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Combined with automated multi-currency revaluations and consolidated trial balances in Power BI, enterprise leadership obtains certified, audit-ready balance sheets and P&L dashboards within 48 hours of month-end.",
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
  console.log("🌱 Seeding 2 New Enterprise Blogs (Predictive Maintenance & Accelerated Close)...");

  // Step 1: Admin Login
  let token = null;
  try {
    const loginRes = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginRes.ok) {
      const err = await loginRes.text();
      console.error(`❌ Admin login failed (${loginRes.status}):`, err);
      process.exit(1);
    }

    const loginData = await loginRes.json();
    token = loginData.token || loginData.data?.token;
    console.log("✅ Admin authentication successful.");
  } catch (err) {
    console.error("❌ Network error logging into admin API:", err.message);
    process.exit(1);
  }

  // Step 2: Publish blogs
  for (const blogData of NEW_TWO_BLOGS) {
    console.log(`\n📝 Publishing: "${blogData.title}"...`);
    try {
      const createRes = await fetch(`${API_URL}/api/admin/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogData),
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error(`❌ Failed to publish "${blogData.slug}" (${createRes.status}):`, errorText);
      } else {
        const result = await createRes.json();
        console.log(`✅ Successfully published "${blogData.slug}"! ID:`, result.data?.id || result.blog?.id || "OK");
      }
    } catch (err) {
      console.error(`❌ Error publishing "${blogData.slug}":`, err.message);
    }
  }

  console.log("\n🎉 Seeding complete!");
}

runSeed();

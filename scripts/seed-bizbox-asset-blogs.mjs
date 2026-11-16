/**
 * Seed script to publish 2 new BizBox & Enterprise Asset Management blogs into the database.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.flutterflirt.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@flutterflirt.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "memyselfherog@123";

const BIZBOX_ASSET_BLOGS = [
  // 1. Know Where Every Asset Is: Enterprise Asset Tracking with BizBox
  {
    title: "Know Where Every Asset Is: Modern Fixed Asset Lifecycle Management with BizBox",
    slug: "know-where-every-asset-is-modern-fixed-asset-management-with-bizbox",
    excerpt: "Track laptops, machines, generators, and vehicle fleets across multiple branch locations with automated assignment history, service schedules, and depreciation tracking in BizBox.",
    cover_image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80",
    category: "BizBox & ERP",
    author: "FlutterFlirt Product Engineering Team",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The Multi-Location Asset Blindspot",
        slug: "the-multi-location-asset-blindspot",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "As companies scale across multiple offices, branches, and regional hubs, tracking enterprise physical assets—from employee laptops and IT gear to warehouse forklifts and standby generators—quickly spirals out of control. Fragmented spreadsheets lead to missing equipment, overlooked maintenance deadlines, audit gaps, and phantom asset write-offs.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "BizBox Asset Management (assets.flutterflirt.com) provides an executive command center that unifies physical asset tagging, real-time location distribution (BLR, BPL, IDR, DEL, MUM), and custodian assignments in one centralized dashboard.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Core Pillars of the BizBox Asset Engine",
        slug: "core-pillars-of-the-bizbox-asset-engine",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Designed for high transactional velocity and multi-branch operations, BizBox equips finance, IT, and operations leaders with four foundational capabilities:",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "• Asset Register & QR/Barcode Tags: Instant identification and digital onboarding of every physical asset with unique asset IDs (e.g. AST-0981 for laptops, AST-0544 for generators).\n• Complete Assignment History: Granular audit trails recording who was issued which asset, custody handoffs between team members, and return sign-offs.\n• Automated Service Reminders: Calendarized maintenance workflows tracking upcoming preventative maintenance schedules and assigning tickets to IT Desk, Facilities, or Warehouse managers.\n• Multi-Standard Depreciation Engines: Automated depreciation schedules calculated using both Straight Line Method (SLM) and Written Down Value (WDV) adhering to statutory financial reporting standards.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Eliminating Audit Gaps and Maximizing Asset Value",
        slug: "eliminating-audit-gaps-and-maximizing-asset-value",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "By replacing error-prone manual spreadsheets with BizBox, enterprise organizations eliminate audit gaps, optimize asset utilization across branches, and ensure 100% compliance during fiscal year-end physical inventory reconciliations.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  // 2. Automating Fixed Asset Depreciation & Preventative Maintenance
  {
    title: "Straight-Line vs. WDV Depreciation & Preventative Service: Optimizing Heavy Equipment and IT Assets",
    slug: "straight-line-vs-wdv-depreciation-and-preventative-service-management",
    excerpt: "How automated depreciation models and proactive service scheduling in BizBox preserve capital, streamline tax compliance, and prevent costly machinery breakdowns.",
    cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    category: "Asset Management",
    author: "FlutterFlirt ERP Architecture Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "Automating Tax & Books Depreciation Calculations",
        slug: "automating-tax-and-books-depreciation-calculations",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Managing fixed asset depreciation manually across hundreds or thousands of active assets is one of the most tedious tasks for corporate accounting teams. Differing rules between corporate books and statutory tax mandates (such as Companies Act SLM rates vs. Income Tax WDV blocks) frequently introduce balance sheet calculation discrepancies.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "BizBox automates multi-book depreciation ledger generation out of the box. Finance leaders can simulate useful life, salvage values, and monthly run rates while keeping asset book values synchronized with general ledger accounts in real time.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Preventative Maintenance: Protecting Equipment Lifecycles",
        slug: "preventative-maintenance-protecting-equipment-lifecycles",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Beyond bookkeeping, managing heavy machinery, facility generators, and corporate vehicle fleets requires strict adherence to service intervals.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "• Dynamic Service Scheduling: Automated triggers based on operating hours, mileage, or calendar milestones.\n• Maintenance Ownership & SLA Routing: Work orders are routed directly to designated departments—from Facilities and Warehouse teams to external vendor service providers.\n• IoT Telemetry Integration: Connecting smart current and vibration sensors to trigger predictive service alerts before critical component failure occurs.\n• Comprehensive Service Logbook: Permanent service documentation that maximizes resale and salvage value when retiring aging equipment.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "The FlutterFlirt BizBox Advantage",
        slug: "the-flutterflirt-bizbox-advantage",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "BizBox brings together inventory, billing, field ticketing, and asset management into one unified cloud workspace. By connecting your assets directly with accounting and branch operations, FlutterFlirt gives modern enterprises total transparency and control over their capital investments.",
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
  console.log("🌱 BizBox & Asset Management Blogs Seed");
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
    console.log("\nInserting " + BIZBOX_ASSET_BLOGS.length + " blogs into database...\n");
    for (const blog of BIZBOX_ASSET_BLOGS) {
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

  console.log("\n🎉 Both BizBox & Asset Management blogs published successfully!");
}

runSeed();

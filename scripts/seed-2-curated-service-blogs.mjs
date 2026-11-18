/**
 * Seed script to publish 2 new curated service blogs (Omnichannel Field Service & Cloud Landing Zones).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.flutterflirt.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@flutterflirt.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "memyselfherog@123";

const NEW_TWO_SERVICE_BLOGS = [
  // 1. Omnichannel Contact Center & Field Service Intelligence
  {
    title: "Omnichannel Field Service Intelligence: Unifying Customer Service and Dispatch with Dynamics 365",
    slug: "omnichannel-field-service-intelligence-unifying-customer-service-and-dispatch",
    excerpt: "How modern enterprises connect AI-powered voice bots, WhatsApp ticketing, and intelligent technician dispatch to boost first-time fix rates above 35%.",
    cover_image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
    category: "CRM & Field Service",
    author: "FlutterFlirt Customer Experience Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The Friction of Disjointed Service Desks and Field Crews",
        slug: "the-friction-of-disjointed-service-desks-and-field-crews",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "In many equipment, machinery, and facility operations, the customer support desk and field service engineering teams operate in separate software silos. When a client calls or messages via WhatsApp about malfunctioning hardware, call center agents manually re-key ticket details into scheduling spreadsheets or separate dispatch apps. The result is delayed dispatch, duplicate technician trips, and frustrated customers.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt architects unified Customer Engagement ecosystems using Microsoft Dynamics 365 Customer Service, Omnichannel for Voice/Messaging, and Dynamics 365 Field Service to connect customer intake seamlessly with mobile technician execution.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Intelligent Resource Scheduling Optimization (RSO)",
        slug: "intelligent-resource-scheduling-optimization-rso",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Manual technician scheduling cannot scale across multi-city service operations. Automated Resource Scheduling Optimization algorithms match work order requirements with field constraints in real time:",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "• Technician Skill Matching: Ensuring high-voltage electrical, HVAC, or certified mechanical tasks are assigned only to qualified personnel.\n• Real-Time Traffic Routing: Minimizing windshield travel time and carbon footprints between jobs using Bing Maps enterprise routing.\n• Van Stock & Spare Parts Inventory: Checking on-board spare part stock before dispatch to guarantee the technician has the replacement parts in the van.\n• Mobile Inspection Checklists: Digital step-by-step diagnostic workflows on mobile tablets with photo upload verification and digital customer sign-offs.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Measurable Business Impact: Exceeding 90% Customer CSAT",
        slug: "measurable-business-impact-exceeding-90-customer-csat",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "By closing the loop between initial customer outreach, automated dispatch, and field resolution, enterprises partnering with FlutterFlirt increase first-time fix rates by over 34%, eliminate manual data re-entry, and deliver seamless 24/7 service transparency.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  // 2. Enterprise Azure Cloud Landing Zones & Zero-Trust Governance
  {
    title: "Enterprise Azure Landing Zones: Architecting Secure, High-Throughput Cloud Ecosystems for ERP & AI",
    slug: "enterprise-azure-landing-zones-architecting-secure-cloud-ecosystems-for-erp-and-ai",
    excerpt: "A strategic blueprint for engineering scalable, Zero-Trust Azure cloud landing zones that power mission-critical Dynamics 365, private OpenAI models, and automated Data Factory pipelines.",
    cover_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
    category: "Azure & Cloud",
    author: "FlutterFlirt Cloud Architecture Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "Why Cloud Deployments Fail Without a Formal Landing Zone",
        slug: "why-cloud-deployments-fail-without-a-formal-landing-zone",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "As enterprise technology teams adopt cloud ERP, automated ETL pipelines, and private generative AI models, cloud environments quickly turn into unmanaged tangles of virtual machines, unencrypted storage blobs, and runaway consumption bills. Without a structured foundation, security audits stall production cutovers and integration bottlenecks choke throughput.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt designs and deploys scalable Enterprise Cloud Landing Zones built strictly in accordance with the Microsoft Cloud Adoption Framework (CAF) and Zero-Trust architecture principles.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Core Architecture: Hub-and-Spoke Topology & Automated Guardrails",
        slug: "core-architecture-hub-and-spoke-topology-and-automated-guardrails",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Our certified cloud solution architects isolate development, staging, and production environments while centralizing enterprise networking and security policies.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "• Hub-and-Spoke Networking: Dedicated Virtual WAN hubs hosting centralized Azure Firewalls, ExpressRoute gateways, and DNS resolvers connecting seamlessly to on-premise data centers.\n• Private Endpoints & Zero Public IP Exposure: Routing ERP API traffic, Azure SQL databases, and Cosmos DB instances exclusively across internal private subnets.\n• Infrastructure-as-Code (IaC): 100% reproducible deployments automated using modular Bicep and Terraform scripts integrated into GitHub Actions CI/CD pipelines.\n• Automated Cost & Security Governance: Azure Policy definitions preventing unauthorized resource regions, enforcing encryption in transit, and setting budget anomaly notifications.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "The FlutterFlirt Cloud Engineering Advantage",
        slug: "the-flutterflirt-cloud-engineering-advantage",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Whether deploying high-volume Azure Synapse data lakes, hosting high-performance Next.js portals, or running mission-critical Dynamics 365 integrations, FlutterFlirt ensures your cloud infrastructure guarantees 99.99% uptime, strict regulatory compliance, and predictable cost efficiency.",
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
      const errText = await authRes.text();
      console.error("❌ Authentication failed (status " + authRes.status + "):", errText);
      return;
    }
  } catch (err) {
    console.error("❌ Network error: " + err.message);
    return;
  }

  if (token) {
    console.log("\nInserting " + NEW_TWO_SERVICE_BLOGS.length + " blogs into database...\n");
    for (const blog of NEW_TWO_SERVICE_BLOGS) {
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

  console.log("\n🎉 Both blogs processed!");
}

runSeed();

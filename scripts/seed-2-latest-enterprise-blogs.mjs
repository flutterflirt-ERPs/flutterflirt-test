/**
 * Seed script to publish 2 new enterprise technology blogs:
 * 1. Autonomous AI Agents & Copilot Studio with Dynamics 365
 * 2. Enterprise Next.js Microfrontends & Headless ERP Portals
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.flutterflirt.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@flutterflirt.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "memyselfherog@123";

const NEW_TWO_BLOGS = [
  // 1. Autonomous AI Agents & Copilot Studio
  {
    title: "Autonomous AI Agents in the Enterprise: Building Production Copilots with Dynamics 365 and Power Platform",
    slug: "autonomous-ai-agents-building-production-copilots-dynamics-365",
    excerpt: "How forward-thinking enterprises deploy multi-agent Copilot Studio workflows that automatically triage customer tickets, audit inventory anomalies, and trigger ERP ledger transactions.",
    cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
    category: "AI & Power Platform",
    author: "FlutterFlirt AI & Automation Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "Moving Beyond Simple Chatbots to Autonomous Agentic Workflows",
        slug: "moving-beyond-chatbots-to-agentic-workflows",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "First-generation enterprise chatbots were largely static FAQ matchers. When complex operational requests arrived—such as re-routing a delayed shipment or validating credit limits for a rush purchase order—chatbots reached their limits and forced human intervention. Autonomous AI agents represent a fundamental architectural leap.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "By integrating Microsoft Copilot Studio with Dynamics 365 and Dataverse, FlutterFlirt engineers agentic workflows capable of multi-step reasoning. These agents inspect customer agreements, verify warehouse stock levels, determine credit eligibility via ERP APIs, and orchestrate approvals without manual back-and-forth.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Architecting Grounded Knowledge with Retrieval-Augmented Generation (RAG)",
        slug: "architecting-grounded-knowledge-with-rag",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "An enterprise AI agent is only as dependable as the data grounding its decisions. To eliminate hallucinations, FlutterFlirt connects Azure OpenAI models to private enterprise knowledge bases using Azure AI Search and Dataverse semantic indexing.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Whether referencing standard operating procedures (SOPs), machine warranty contracts, or customized client pricing tiers, the AI agent cites deterministic internal documents with verified provenance before executing automated tasks.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Enterprise Guardrails, Security Boundaries, and Human-in-the-Loop Governance",
        slug: "enterprise-guardrails-and-governance",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Autonomy does not mean lack of control. FlutterFlirt implements fine-grained RBAC (Role-Based Access Control), content moderation filters, and explicit transaction threshold gates within Power Automate. High-impact operations—such as purchase order approvals exceeding $50,000 or customer contract alterations—automatically prompt managers with summarized agent recommendations for final sign-off.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This balanced architecture delivers the speed of continuous autonomous processing while retaining strict corporate governance and audit readiness.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  // 2. Headless B2B Portals with Next.js & React
  {
    title: "Headless ERP Architecture: Crafting Sub-Second B2B Portals with Next.js and Dynamics 365",
    slug: "headless-erp-architecture-subsecond-b2b-portals-nextjs-dynamics",
    excerpt: "Why modern enterprises are decoupling customer-facing portals from legacy ERP screens—leveraging Next.js App Router, edge caching, and unified GraphQL APIs for unmatched customer experience.",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    category: "Custom Development",
    author: "FlutterFlirt Web Engineering Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The Legacy ERP Bottleneck in Modern B2B Commerce",
        slug: "legacy-erp-bottleneck-in-b2b-commerce",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Legacy ERP customer portals are notoriously slow, clunky, and rigid. Exposing internal Dynamics 365 or SAP transaction screens directly to enterprise B2B distributors and partners leads to high bounce rates, confusing invoice navigation, and heavy load on transactional database servers.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "By adopting a headless architecture, enterprises decouple the high-speed customer frontend from the transactional ERP system of record. FlutterFlirt builds blazing-fast B2B dealer portals using Next.js, React Server Components, and Tailwind CSS, backed by resilient cloud caching layers.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Real-Time Pricing, Dynamic Catalogs, and Sub-Second Order Placements",
        slug: "real-time-pricing-and-subsecond-order-placements",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "B2B purchasing requires complex localized tier pricing, customer-specific discounts, and live inventory validation across multiple regional warehouses. Next.js Incremental Static Regeneration (ISR) and Edge Middleware allow static-level speeds for product catalogs while fetching personalized price matrices in sub-100ms via microservices.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Partners can browse thousands of SKUs, check stock by regional depot, and submit multi-pallet bulk orders effortlessly—with every transaction validated and queued securely into Dynamics 365 F&O or Business Central in real time.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Security, Session Isolation, and High-Throughput API Gateway Layer",
        slug: "security-session-isolation-and-api-gateway",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "A headless portal protects internal ERP infrastructure from exposure to the public internet. FlutterFlirt architectures an Azure API Management gateway that handles authentication via Microsoft Entra ID (Azure AD), enforces rate limiting, and normalizes disparate data formats.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "The outcome is a resilient digital storefront that scales to thousands of concurrent distributor visits during peak fiscal cycles without consuming ERP licensing seats or degrading core accounting performance.",
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
  console.log("🌱 Seeding 2 New Blogs (AI Agents & Headless Next.js ERP Portals)...");

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

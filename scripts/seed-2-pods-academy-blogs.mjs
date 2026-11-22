/**
 * Seed script to publish 2 new curated blogs:
 * 1. Engineering Pods: Agile Dedicated Dynamics & Cloud Squads
 * 2. Enterprise D365 Academy: Scaling In-House Dynamics Competency
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.flutterflirt.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@flutterflirt.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "memyselfherog@123";

const NEW_TWO_BLOGS = [
  // 1. Dedicated Engineering Pods
  {
    title: "Scaling Engineering Velocity: Why Enterprise Leaders Choose Dedicated Dynamics & Cloud Pods",
    slug: "scaling-engineering-velocity-dedicated-dynamics-cloud-pods",
    excerpt: "How forward-thinking enterprises eliminate agency overhead and hiring lag by deploying vetted, self-governing Dynamics 365, Azure, and React engineering pods.",
    cover_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    category: "Resource Augmentation",
    author: "FlutterFlirt Talent & Delivery Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The Friction of Traditional IT Staff Augmentation",
        slug: "friction-of-traditional-it-staff-augmentation",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Traditional contract staffing models frequently fall short for complex enterprise systems. Placing isolated contractors into an ongoing Dynamics 365 F&O migration or cloud modernization effort requires weeks of onboarding, creates fragmented delivery ownership, and places a heavy management burden on internal tech leads.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt solves this with Dedicated Engineering Pods—pre-assembled, multi-disciplinary teams composed of Senior Solution Architects, AL/X++ developers, React engineers, and QA automation leads who arrive with shared communication protocols, established CI/CD baselines, and aligned sprint methodologies.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Full-Stack Pod Composition & Self-Governing Sprint Cadence",
        slug: "pod-composition-and-sprint-cadence",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Each FlutterFlirt pod is tailored to the exact architectural phase of the client. During core ERP implementation, pods focus on custom AL extensions, dual-write synchronization, and data migration scripts. In later phases, front-end engineers and Power Platform specialists join the pod to accelerate portal delivery and operational dashboarding.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Operating on structured bi-weekly sprints with automated PR review gates, pods provide transparent sprint burndowns, Jira/Azure DevOps integration, and direct Slack/Teams standup collaboration.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Zero Hiring Lag, Predictable Costs, and Seamless Knowledge Transfer",
        slug: "zero-hiring-lag-and-knowledge-transfer",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Instead of enduring 3-6 month recruitment cycles for niche Dynamics 365 or Azure engineers, organizations deploy productive pods in less than 14 days. Comprehensive code documentation, architectural decision records (ADRs), and sprint handovers ensure internal engineering teams retain complete intellectual property and maintenance independence.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  // 2. D365 Academy & Enterprise Enablement
  {
    title: "Building In-House ERP Independence: The Enterprise Guide to Post-Go-Live Dynamics 365 Mastery",
    slug: "building-in-house-erp-independence-post-go-live-dynamics-mastery",
    excerpt: "Why post-go-live success depends on internal enablement. How structured D365 Academy programs transform super-users into certified solution champions and cut long-term consulting dependencies.",
    cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
    category: "D365 Academy",
    author: "FlutterFlirt Academy Practice",
    featured: false,
    status: "published",
    sections: [
      {
        heading: "The Post-Go-Live Knowledge Cliff",
        slug: "the-post-go-live-knowledge-cliff",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "The critical risk period for any ERP transformation is not the go-live day itself—it is the months that follow. When external implementation consultants roll off, business users and departmental teams often struggle with process exceptions, leading to frustrated employees, reverted manual workarounds, and rising ticket backlogs.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FlutterFlirt’s D365 Academy bridges this knowledge gap through tailored corporate enablement, transitioning internal IT administrators, finance controllers, and supply chain leads into confident platform owners.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Hands-On Curriculum: From Core Workflows to Copilot & Power Automate",
        slug: "hands-on-curriculum-workflows-to-copilot",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Rather than generic slide decks, our Academy programs utilize sandboxed client environments with real-world business scenarios. Participants master multi-currency ledger adjustments, custom report configuration in Power BI, automated flow design in Power Automate, and prompt engineering with Microsoft Copilot.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Modules are mapped directly to official Microsoft certification pathways (MB-300, MB-310, MB-800, PL-300), enabling internal staff to earn certified credentials while driving immediate operational value.",
                },
              ],
            },
          ],
        },
      },
      {
        heading: "Sustainable ROI: Eliminating Eternal Advisory Retainers",
        slug: "sustainable-roi-eliminating-eternal-retainers",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "By investing in a structured in-house academy program, enterprises reduce Tier-1 and Tier-2 support costs by up to 60%. Internal teams resolve daily exceptions rapidly, adapt system parameters to changing business needs, and maintain self-sufficient digital transformation momentum.",
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
  console.log("🌱 Seeding 2 New Curated Blogs (Engineering Pods & D365 Academy)...");

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

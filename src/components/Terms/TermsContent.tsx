"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";

interface TermsSection {
  id: string;
  title: string;
}

const SECTIONS: TermsSection[] = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "services", title: "2. Services & Engagements" },
  { id: "intellectual-property", title: "3. Intellectual Property" },
  { id: "confidentiality", title: "4. Confidentiality & Security" },
  { id: "billing", title: "5. Fees & Invoicing" },
  { id: "warranties", title: "6. Warranties & Disclaimers" },
  { id: "limitation-liability", title: "7. Limitation of Liability" },
  { id: "termination", title: "8. Term & Termination" },
  { id: "governing-law", title: "9. Governing Law & Jurisdiction" },
  { id: "contact", title: "10. Contact Information" },
];

export default function TermsContent() {
  const [activeSection, setActiveSection] = useState<string>("acceptance");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#dfeaf3] pt-[110px] pb-20 sm:pt-[130px] sm:pb-32">
      <div className="relative mx-auto w-full max-w-[1360px] px-6 sm:px-10 md:px-14 lg:px-16">
        {/* Header */}
        <div className="mb-12 border-b border-[#0a0f16]/10 pb-8 sm:mb-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[14px] font-semibold tracking-wider text-[#2773e6] uppercase">
                Enterprise Legal Framework
              </span>
              <h1 className="mt-2 text-[36px] font-bold tracking-tight text-[#0a0f16] sm:text-[46px] md:text-[52px]">
                Terms of Service
              </h1>
            </div>
            <div className="text-right text-[13px] text-[#475569]">
              <p>Effective Date: January 1, 2026</p>
              <p>Entity: FlutterFlirt Technologies Pvt. Ltd.</p>
            </div>
          </div>
          <p className="mt-4 max-w-[800px] text-[16px] leading-[1.6] text-[#475569]">
            These Terms of Service (&quot;Terms&quot;) define the agreement between FlutterFlirt Technologies
            Pvt. Ltd. (&quot;FlutterFlirt&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;) and your enterprise or
            organization (&quot;Client&quot;, &quot;you&quot;) regarding software development, consulting, cloud integrations,
            and digital platform services.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          {/* Table of Contents Sticky Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-[120px] rounded-2xl border border-white/60 bg-white/70 p-6 backdrop-blur-md shadow-sm">
              <h2 className="text-[14px] font-bold tracking-wider text-[#0a0f16] uppercase">
                Contents
              </h2>
              <nav className="mt-4 flex flex-col space-y-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left text-[14px] transition-colors py-1 ${
                      activeSection === section.id
                        ? "font-semibold text-[#2773e6]"
                        : "text-[#475569] hover:text-[#0a0f16]"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Legal Sections */}
          <div className="space-y-12 rounded-3xl border border-white/60 bg-white/80 p-8 sm:p-12 shadow-sm backdrop-blur-md">
            {/* 1. Acceptance */}
            <section id="acceptance" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                By executing a Statement of Work (&quot;SOW&quot;), Master Services Agreement (&quot;MSA&quot;), accessing our
                digital platforms, or engaging FlutterFlirt for technology consulting services, you accept and agree to be bound
                by these Terms. If you are entering into this agreement on behalf of a company or other legal entity, you represent
                that you have the authority to bind such entity.
              </p>
            </section>

            {/* 2. Services */}
            <section id="services" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                2. Services & Engagements
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                FlutterFlirt provides enterprise technology services, including but not limited to Microsoft Dynamics 365
                (Finance & Operations, Business Central, CRM), Power Platform automation, Microsoft Azure cloud architecture,
                custom web/mobile application engineering, and staff augmentation.
              </p>
              <p className="mt-2 text-[15px] leading-[1.8] text-[#475569]">
                Each specific engagement shall be governed by an approved SOW or proposal specifying deliverables, milestones,
                projected timelines, and fee structures. In the event of a conflict between an executed SOW and these general Terms,
                the executed SOW shall prevail for that specific scope.
              </p>
            </section>

            {/* 3. Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                3. Intellectual Property
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                <strong>Client Deliverables:</strong> Upon receipt of full payment for agreed milestones, all custom intellectual
                property, code, workflows, and documentation created specifically for the Client shall transfer to the Client.
              </p>
              <p className="mt-2 text-[15px] leading-[1.8] text-[#475569]">
                <strong>Pre-existing IP & Tools:</strong> FlutterFlirt retains all ownership of pre-existing development frameworks,
                accelerators, proprietary libraries, and generalized knowledge base tooling. Clients receive a perpetual, non-exclusive
                license to use such components as integrated into their deliverables.
              </p>
            </section>

            {/* 4. Confidentiality & Security */}
            <section id="confidentiality" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                4. Confidentiality & Security
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                Both parties agree to protect and treat as confidential all technical specifications, business processes, trade
                secrets, source code, and customer data shared during the engagement. FlutterFlirt enforces strict role-based access
                controls, non-disclosure agreements across engineering staff, and alignment with enterprise security frameworks.
              </p>
            </section>

            {/* 5. Fees & Invoicing */}
            <section id="billing" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                5. Fees & Invoicing
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                Invoices are issued according to the payment schedule outlined in your SOW (Time & Material, Milestone, or Retainer basis).
                Payment terms are typically net 15 or net 30 days from date of invoice. Applicable taxes (GST/VAT) will be charged
                as per statutory requirements.
              </p>
            </section>

            {/* 6. Warranties */}
            <section id="warranties" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                6. Warranties & Disclaimers
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                FlutterFlirt warrants that all engineering and consulting services will be performed in a professional, workmanlike
                manner adhering to industry standards. Custom deliverables include an agreed warranty and stabilization window
                (typically 30-90 days post deployment as defined in the SOW) to rectify defects identified in scope.
              </p>
            </section>

            {/* 7. Limitation of Liability */}
            <section id="limitation-liability" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                7. Limitation of Liability
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                To the maximum extent permitted by law, neither party shall be liable for indirect, incidental, punitive, or consequential
                damages, including lost revenue or profits. Total cumulative liability under any SOW shall not exceed the total fees paid
                by Client to FlutterFlirt under that applicable SOW during the preceding 12 months.
              </p>
            </section>

            {/* 8. Termination */}
            <section id="termination" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                8. Term & Termination
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                Either party may terminate an engagement for cause upon 30 days written notice if the other party breaches any material
                provision and fails to cure such breach. Upon termination, Client will pay for all approved work completed and hours logged
                up to the effective termination date.
              </p>
            </section>

            {/* 9. Governing Law */}
            <section id="governing-law" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                9. Governing Law & Jurisdiction
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                These Terms and any dispute arising from them shall be governed by and construed in accordance with the laws of India.
                The courts in Bengaluru, Karnataka, India shall have exclusive jurisdiction over any claims or proceedings arising hereunder.
              </p>
            </section>

            {/* 10. Contact */}
            <section id="contact" className="scroll-mt-28">
              <h2 className="text-[22px] font-bold text-[#0a0f16] sm:text-[26px]">
                10. Contact Information
              </h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475569]">
                For legal inquiries, contracts, or questions regarding these Terms of Service, please reach out to our legal department:
              </p>
              <div className="mt-4 rounded-xl bg-[#f8fafc] p-5 text-[14px] text-[#334155]">
                <p className="font-semibold text-[#0a0f16]">FlutterFlirt Technologies Pvt. Ltd.</p>
                <p className="mt-1">Email: <a href="mailto:info@flutterflirt.com" className="text-[#2773e6] underline">info@flutterflirt.com</a></p>
                <p>Corporate Office: Bengaluru, Karnataka, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

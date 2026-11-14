import { ArrowLeft, AlertCircle, FileCheck, Scale } from 'lucide-react';

interface TermsConditionsViewProps {
  onBack: () => void;
  onNavigateToPrivacy: () => void;
}

export default function TermsConditionsView({ onBack, onNavigateToPrivacy }: TermsConditionsViewProps) {
  return (
    <div className="pt-28 pb-32 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Home</span>
          </button>

          <button
            onClick={onNavigateToPrivacy}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer underline"
          >
            <span>Privacy Policy →</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
            Aman Computer — Legal Information
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-neutral-950 dark:text-neutral-50 tracking-tight mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Terms and conditions governing the provision of digital services, online form filling, documentation assistance, and cyber cafe operations at Aman Computer.
          </p>
        </div>

        {/* Non-Government Authority Notice Callout */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-12">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Important Non-Government Notice</span>
          </div>
          <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
            <b>Aman Computer is an independent private digital assistance and facilitation center.</b> We are <b>not</b> a government authority, official department, or recruitment agency. Government approvals, exam schedules, document verifications, card issuance, and application decisions remain exclusively within the purview of the respective statutory government authorities.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-[#1A1818] dark:text-[#E8E4E0] text-base leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              1. Acceptance of Terms
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              By accessing our website, visiting our cyber cafe center, or initiating a service request via WhatsApp or in person, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not utilize our digital assistance services.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              2. Nature of Services Offered
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              Aman Computer provides manual, technical, and logistical digital assistance to individuals and organizations, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Online job application submissions and entrance exam form filling.</li>
              <li>Identity card facilitation (PAN Card applications/corrections, Aadhaar update guidance, Voter ID enrollment).</li>
              <li>Government certificates, academic admissions, and welfare scheme assistance.</li>
              <li>High-speed laser printing, color photocopying, precision document scanning, and thermal lamination.</li>
              <li>Banking facilitation via AEPS cash withdrawal assistance and domestic money transfers.</li>
              <li>Travel ticketing assistance (IRCTC railway reservations, bus, and flight bookings).</li>
              <li>Utility bill payments and mobile recharges.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              3. Customer Responsibilities &amp; Accurate Information
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              Customers bear sole responsibility for the veracity of the information and documents they present:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>You must provide authentic, legitimate, and current identity cards, academic records, and contact details.</li>
              <li>Customers must thoroughly review the final preview screen or draft printout before authorizing our staff to submit any application form.</li>
              <li>Aman Computer shall not be responsible for consequences arising from incorrect data (e.g. spelling of name, father's name, date of birth, caste category, roll numbers) provided or approved by the customer.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              4. Government Application &amp; Documentation Disclaimers
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              Our role is limited strictly to manual data entry, format conversion, document resizing, and submission on publicly available portals at your direction:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>
                <b>No Guarantee of Approval:</b> We do not guarantee job selection, exam admittance, visa issuance, or document approval. Acceptance or rejection of applications rests entirely with the examining or administrative government bodies.
              </li>
              <li>
                <b>Official Rules Apply:</b> Qualification criteria, reservation quotas, syllabus, fee exemptions, and cut-off dates are established by government authorities and are subject to change without our knowledge.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              5. Fees, Payments &amp; Applicable Charges
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              All service charges are transparently communicated:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>
                <b>Aman Computer Service Fee:</b> A nominal charge covering manual assistance, typing, image cropping, scanning, computer usage, and high-quality printing.
              </li>
              <li>
                <b>Official Government / Portal Fee:</b> Mandatory fees levied directly by the respective government department, university, or exam board. These are collected on actuals or paid directly via official payment gateways.
              </li>
              <li>Payment must be made upon service completion via cash, UPI, or accepted digital modes.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              6. Corrections, Cancellations &amp; Refunds
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              Refunds and cancellations are subject to the specific service and applicable rules:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>
                <b>Official Portal Fees:</b> Once an official application fee is submitted to a government portal and a Challan / Transaction ID is generated, the fee is strictly <b>non-refundable</b> in accordance with government regulations.
              </li>
              <li>
                <b>Aman Computer Assistance Fees:</b> Service fees for completed manual data entry, printing, lamination, or scanning cannot be refunded once the service has been rendered.
              </li>
              <li>
                <b>Technical Error Prior to Submission:</b> If a submission fails prior to payment generation due to an internal technical issue on our end, we will either re-attempt the submission without extra fee or refund any collected assistance fee.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              7. Third-Party Portals &amp; Government Websites
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              We rely on external government servers and public internet gateways:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Aman Computer is not liable for server downtime, maintenance blackouts, slow gateway responses, OTP delivery delays, or technical crashes of official government portals (such as SSC, NSDL, UIDAI, IRCTC, or state exam portals).</li>
              <li>In peak application windows (such as exam closing dates), portal server congestion is common; customers are strongly advised to apply well before deadline dates.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              8. Service Availability &amp; Processing Times
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              Turnaround times communicated by our team (e.g., e-PAN generation within 48 hours or certificate delivery) are based on typical administrative processing estimates and are not guaranteed deadlines. Actual processing is governed by external departmental timelines.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              9. Customer Data &amp; Privacy
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              All customer documents and details are handled in strict adherence to our{' '}
              <button
                onClick={onNavigateToPrivacy}
                className="underline font-semibold hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              >
                Privacy Policy
              </button>. Temporary files created on cafe computers are routinely purged after completion of the requested task.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              10. Limitation of Liability
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              To the fullest extent permitted by applicable law, Aman Computer and its operators shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Rejection of an application by a government entity due to customer eligibility or criteria mismatches.</li>
              <li>Postal transit delays or non-delivery of physical PAN cards, driving licences, or voter cards dispatched by government departments.</li>
              <li>Changes in exam dates, center allocations, or government scheme guidelines made by official authorities.</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              11. Prohibited Misuse of Services
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              Customers agree not to utilize our center or services for any unlawful purpose:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Submission of fake, forged, manipulated, or counterfeit certificates, signatures, or identity documents is strictly prohibited.</li>
              <li>Impersonation or attempt to bypass security protocols of any citizen or educational portal is prohibited.</li>
              <li>Aman Computer reserves the right to immediately refuse service to anyone requesting illegal, fraudulent, or suspicious activities.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              12. Changes to Terms
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              Aman Computer reserves the right to amend these Terms &amp; Conditions at any time. Any changes will become effective upon being published on this page. Continued usage of our services after such posting signifies acceptance of the updated terms.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              13. Contact &amp; Grievance Enquiries
            </h2>
            <div className="p-6 rounded-2xl bg-[#DED8D4]/60 dark:bg-[#252121]/50 border border-[#D5CDCA] dark:border-[rgba(196,176,176,0.2)]">
              <p className="font-bold text-base text-[#1A1818] dark:text-white">
                Aman Computer — Cyber Cafe &amp; Digital Center
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Online &amp; Government Services | Customer-focused Digital Assistance
              </p>
              <p className="text-sm mt-3">
                Direct WhatsApp Grievance Assistance:{' '}
                <a
                  href="https://wa.me/918595515718"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#1A1818] dark:text-white"
                >
                  +91 8595515718
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <div>Last updated: November 2026. © 2026 Aman Computer. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="hover:underline cursor-pointer">
              ← Home
            </button>
            <span>|</span>
            <button onClick={onNavigateToPrivacy} className="hover:underline cursor-pointer">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
  onNavigateToTerms: () => void;
}

export default function PrivacyPolicyView({ onBack, onNavigateToTerms }: PrivacyPolicyViewProps) {
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
            onClick={onNavigateToTerms}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer underline"
          >
            <span>Terms &amp; Conditions →</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
            Aman Computer — Legal Information
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-neutral-950 dark:text-neutral-50 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            How Aman Computer collects, handles, and safeguards customer information, documentation, and communication across our cyber cafe and digital assistance services.
          </p>
        </div>

        {/* Quick Summary Box */}
        <div className="p-6 rounded-2xl bg-[#DED8D4]/60 dark:bg-[#252121]/50 border border-[#D5CDCA] dark:border-[rgba(196,176,176,0.2)] mb-12">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy Summary</span>
          </div>
          <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Aman Computer handles customer documents solely for requested form filling, application processing, scanning, or printing. We do not sell your personal information, deploy behavioral ad-tracking cookies, or maintain unauthorized copies of your identity documents.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-[#1A1818] dark:text-[#E8E4E0] text-base leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              1. Introduction and Privacy Commitment
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              At Aman Computer, we recognize that our customers entrust us with sensitive personal details, identification documents, and official applications. We are committed to maintaining the confidentiality, integrity, and security of all personal data shared with us, whether in person at our digital center, over WhatsApp, or through this website.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              2. Who Operates Aman Computer
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              This digital service assistance center and website are operated by <b>Aman Computer</b> (Cyber Cafe &amp; Digital Center), providing citizen documentation facilitation, online form submissions, identity card applications, and digital services.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300">
              For any privacy inquiries or document clearance requests, you can reach us directly via our verified communication channel on WhatsApp at{' '}
              <a
                href="https://wa.me/918595515718"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-neutral-950 dark:hover:text-white"
              >
                +91 8595515718
              </a>.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              3. Information Collected From Website Visitors
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              This website is designed primarily as an informational portal. We collect minimal technical information necessary for providing and displaying our pages:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>
                <b>Interface &amp; Theme Preferences:</b> Your browser stores your dark/light mode preference in local storage. This value remains entirely on your device and is never transmitted to any external server.
              </li>
              <li>
                <b>Server Access Logs:</b> As with standard web servers, hosting providers may temporarily record technical connection data (such as IP addresses, browser user-agent, and request timestamps) solely to maintain network security and defend against abuse.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              4. Information Collected During Service Delivery
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              When you visit Aman Computer or request assistance for specific digital services, you voluntarily provide the details required to process that service, which may include:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li><b>Contact Details:</b> Name, mobile telephone number, and residential address.</li>
              <li><b>Identity Details:</b> Aadhaar number, PAN details, Voter ID number, Driving Licence number, or date of birth as necessary for the specific citizen portal.</li>
              <li><b>Academic &amp; Employment Details:</b> Educational marks, certificates, roll numbers, and examination details required for online job applications or entrance exams.</li>
              <li><b>Supporting Documents:</b> Passport photos, signature scans, and certificate copies for format conversion and portal upload.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              5. WhatsApp Communication &amp; Enquiries
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              Customers often connect with us via WhatsApp (<a href="https://wa.me/918595515718" target="_blank" rel="noopener noreferrer" className="underline font-semibold">+91 8595515718</a>) to check application requirements, verify document eligibility, receive status updates, or send files for printing:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Messages transmitted over WhatsApp are subject to WhatsApp's end-to-end encryption.</li>
              <li>Information and files shared via WhatsApp are used strictly to address your specific enquiry or complete your requested service.</li>
              <li>We do not send unsolicited promotional broadcasts or spam messages.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              6. Website Analytics &amp; Cookies
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              To accurately describe our technical implementation:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>This website <b>does not</b> use third-party advertising cookies or cross-site tracking pixels.</li>
              <li>We do not share your browsing habits with ad networks or data brokers.</li>
              <li>Local storage is used strictly for functional client-side preferences (such as dark mode and local UI state) and does not track you across the web.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              7. Data Storage, Security &amp; Retention
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              We enforce strict data handling hygiene across our workstations:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li><b>No Unauthorized Copies:</b> Customer identification cards, certificates, photos, and signatures are used strictly to complete the service requested.</li>
              <li><b>Workstation Hygiene:</b> Files uploaded to local computers for printing, cropping, resizing, or form filling are routinely cleared and deleted once the task is finished.</li>
              <li><b>Customer Acknowledgments:</b> Printed copies, application receipts, challans, and original certificates are handed over directly to the customer.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              8. Third-Party Websites &amp; Government Portals
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              Our service involves assisting customers in entering data into official government and service provider portals (such as NSDL/UTIITSL for PAN, UIDAI for Aadhaar facilitation, State/Central recruitment boards, scholarship portals, electricity boards, and IRCTC for travel booking):
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Once information is submitted to an official portal at your direction, that information is governed by the respective government authority or service provider's privacy policy and security practices.</li>
              <li>Aman Computer does not control, operate, or maintain government servers or databases.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              9. Customer Privacy Rights &amp; Data Deletion
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-3">
              You have full authority over your data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>You may request immediate deletion of any temporary files, drafts, or scanned documents from our workstation in your presence.</li>
              <li>You may inspect any application form before final submission to verify that your details have been accurately entered.</li>
              <li>To request deletion or ask questions about our data handling, contact us via WhatsApp at +91 8595515718.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              10. Children's Privacy
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              For applications concerning minors (such as school admissions, minor PAN applications, scholarship forms, or birth certificates), we require that the parent or legal guardian provide the necessary information, documents, and consent.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              11. Policy Updates
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              We may periodically update this Privacy Policy to reflect enhancements in our operational practices or regulatory guidance. Any modifications will be posted here with a revised effective date.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 pb-2 border-b border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)]">
              12. Contact Information
            </h2>
            <div className="p-6 rounded-2xl bg-[#DED8D4]/60 dark:bg-[#252121]/50 border border-[#D5CDCA] dark:border-[rgba(196,176,176,0.2)]">
              <p className="font-bold text-base text-[#1A1818] dark:text-white">
                Aman Computer — Cyber Cafe &amp; Digital Center
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Online &amp; Government Services | Customer-focused Digital Assistance
              </p>
              <p className="text-sm mt-3">
                Direct WhatsApp Assistance:{' '}
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
            <button onClick={onNavigateToTerms} className="hover:underline cursor-pointer">
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

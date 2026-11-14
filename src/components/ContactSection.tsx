import { useState } from 'react';
import { Mail, Phone, MapPin, Copy, Check, Send, ArrowUpRight } from 'lucide-react';
import { ABOUT_DETAILS } from '../data/portfolioData';

interface ContactSectionProps {
  preselectedService?: string;
}

export default function ContactSection({ preselectedService }: ContactSectionProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: preselectedService || 'Web & App Development',
    budget: '$3,000 - $7,000',
    timeline: 'Within 1 Month',
    message: '',
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ABOUT_DETAILS.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 800);
  };

  const servicesList = [
    'Web & App Development',
    'UI/UX & Product Design',
    'Graphic Design & Branding',
    'Creative Photography',
    'Full Product Build'
  ];

  const budgetOptions = [
    '< $2,500',
    '$2,500 – $5,000',
    '$5,000 – $10,000',
    '$10,000+'
  ];

  return (
    <section id="contact" className="py-24 md:py-32 bg-neutral-100/50 dark:bg-neutral-900/40 border-t border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Inquiries & Contact Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                Initiate Collaboration
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mb-6">
                Let's Build Something Exceptional
              </h2>
              <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10">
                Have a project in mind, need design direction, or looking for an experienced full-stack freelancer? Send a message or reach out directly.
              </p>

              {/* Direct Touchpoints */}
              <div className="space-y-4 mb-10">
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">Direct Email</div>
                      <a
                        href={`mailto:${ABOUT_DETAILS.email}`}
                        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
                      >
                        {ABOUT_DETAILS.email}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    title="Copy email to clipboard"
                    className="p-2 rounded-lg text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Phone / WhatsApp</div>
                    <a
                      href={`tel:${ABOUT_DETAILS.phone.replace(/\s+/g, '')}`}
                      className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:underline font-mono"
                    >
                      {ABOUT_DETAILS.phone}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Location</div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {ABOUT_DETAILS.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-6 border-t border-neutral-200/80 dark:border-neutral-800">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Social Profiles
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={ABOUT_DETAILS.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href={ABOUT_DETAILS.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href={ABOUT_DETAILS.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href={ABOUT_DETAILS.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Twitter / X</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm">
              {formSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-neutral-950 dark:text-white">
                    Inquiry Received
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                    Thank you, {formData.name || 'there'}! I have received your project details and will review them shortly. You can expect a response within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        service: 'Web & App Development',
                        budget: '$3,000 - $7,000',
                        timeline: 'Within 1 Month',
                        message: '',
                      });
                    }}
                    className="mt-4 px-5 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-display font-bold text-neutral-950 dark:text-neutral-50">
                    Project Inquiry & Estimation
                  </h3>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Vance"
                        className="w-full px-4 py-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@company.com"
                        className="w-full px-4 py-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Service Needed */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Primary Discipline Required
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {servicesList.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => setFormData({ ...formData, service })}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                            formData.service === service
                              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                              : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Options */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Estimated Project Budget (USD)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {budgetOptions.map((budget) => (
                        <button
                          key={budget}
                          type="button"
                          onClick={() => setFormData({ ...formData, budget })}
                          className={`py-2 text-xs font-mono font-medium rounded-lg border text-center transition-all cursor-pointer ${
                            formData.budget === budget
                              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                              : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          {budget}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Project Goals & Context *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Briefly describe what you're looking to build, any key deadlines, or existing references..."
                      className="w-full px-4 py-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 text-sm font-semibold text-white bg-neutral-950 dark:bg-neutral-100 dark:text-neutral-950 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { SERVICES } from '../data/portfolioData';
import { ArrowRight, Check } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService?: (serviceName: string) => void;
}

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const [activeServiceId, setActiveServiceId] = useState<string>(SERVICES[0].id);

  const handleInquire = (serviceTitle: string) => {
    if (onSelectService) {
      onSelectService(serviceTitle);
    }
    const contactEl = document.querySelector('#contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-24 md:py-32 bg-neutral-100/50 dark:bg-neutral-900/30 border-t border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
            Capabilities & Expertise
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mb-4">
            Services Tailored for Modern Products
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            I work as an independent extension of your team—taking features and brand systems from initial discovery and wireframes to pixel-perfect, performant code.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Number & Title */}
                <div className="flex items-baseline justify-between mb-4">
                  <span className="font-mono text-sm font-semibold text-neutral-400 dark:text-neutral-500">
                    {service.number}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    End-to-End
                  </span>
                </div>

                <h3 className="text-2xl font-display font-bold text-neutral-950 dark:text-neutral-50 mb-3">
                  {service.title}
                </h3>

                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-4 leading-snug">
                  {service.tagline}
                </p>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Deliverables */}
                <div className="space-y-2 mb-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                    Deliverables
                  </div>
                  {service.deliverables.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools & CTA */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {service.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleInquire(service.title)}
                  className="w-full py-3 px-4 text-xs font-semibold text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Inquire for {service.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

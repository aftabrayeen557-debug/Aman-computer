import { WORK_PROCESS } from '../data/portfolioData';

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 md:py-32 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
            Methodology & Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mb-4">
            How We Build Together
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            A transparent, sprint-based approach designed to eliminate guesswork. Every milestone has actionable reviews and continuous feedback loops.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {WORK_PROCESS.map((p, idx) => (
            <div
              key={p.step}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {p.step}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {p.duration}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-neutral-950 dark:text-neutral-50 mb-2">
                  {p.name}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                Phase {idx + 1} of 5
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

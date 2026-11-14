export default function StatsStrip() {
  const stats = [
    {
      value: '5+',
      label: 'Years of Experience',
      sub: 'Engineering web & mobile platforms',
    },
    {
      value: '40+',
      label: 'Projects Delivered',
      sub: 'Web apps, UI/UX systems & branding',
    },
    {
      value: '100%',
      label: 'Accurate Submission',
      sub: 'Verified online documentation & forms',
    },
    {
      value: '2024',
      label: 'Established Hub',
      sub: 'Serving citizens and students daily',
    },
  ];

  return (
    <section className="border-y border-neutral-200 dark:border-neutral-800/80 bg-neutral-100/60 dark:bg-neutral-900/40">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800/80">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col ${idx > 0 ? 'pt-6 md:pt-0 md:pl-6' : ''}`}
            >
              <div className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

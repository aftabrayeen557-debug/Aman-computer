import { useState } from 'react';
import { Project, ProjectCategory } from '../types';
import { PROJECTS, TESTIMONIALS } from '../data/portfolioData';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { Quote } from 'lucide-react';

type FilterType = 'all' | ProjectCategory;

export default function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<FilterType>('all');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Works' },
    { id: 'web-dev', label: 'Web & App Dev' },
    { id: 'ui-ux', label: 'UI/UX Design' },
    { id: 'graphic-design', label: 'Graphic Design' },
    { id: 'photography', label: 'Photography' },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === selectedCategory);


  return (
    <section id="work" className="py-24 md:py-32 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              Selected Projects
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Featured Case Studies & Work
            </h2>
          </div>

          {/* Functional Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl overflow-x-auto max-w-full">
            {filterTabs.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(p) => setActiveProject(p)}
              featuredLayout={idx === 0 && selectedCategory === 'all'}
            />
          ))}
        </div>

        {/* Adjacent Social Proof Claim-to-Proof Adjacency */}
        <div className="mt-16 p-8 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
            {TESTIMONIALS.map((t, idx) => (
              <div key={t.id} className={`${idx > 0 ? 'pt-6 md:pt-0 md:pl-8' : ''} flex flex-col justify-between`}>
                <div>
                  <Quote className="w-5 h-5 text-neutral-400 dark:text-neutral-600 mb-3" />
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 italic leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-950 dark:text-neutral-100">
                    {t.author}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t.role} · {t.company}
                  </div>
                  <div className="mt-2 text-xs font-mono font-medium text-neutral-900 dark:text-neutral-200">
                    {t.verifiedMetric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}

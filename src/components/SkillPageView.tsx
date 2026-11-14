import { useState } from 'react';
import { ArrowLeft, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { NavigationPage, Project } from '../types';
import { PROJECTS, SKILL_DOORS } from '../data/portfolioData';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import InteractiveTaxCalculator from './InteractiveTaxCalculator';
import InteractiveApiCostCalculator from './InteractiveApiCostCalculator';
import InteractiveZerodhaPreview from './InteractiveZerodhaPreview';

interface SkillPageViewProps {
  page: NavigationPage;
  onBack: () => void;
  onContactClick: () => void;
}

export default function SkillPageView({ page, onBack, onContactClick }: SkillPageViewProps) {
  const [selectedModalProject, setSelectedModalProject] = useState<Project | null>(null);

  const doorMeta = SKILL_DOORS.find((d) => d.id === page);

  const categoryMap: Record<NavigationPage, string> = {
    home: 'all',
    'web-development': 'web-dev',
    'app-development': 'app-dev',
    'ui-ux': 'ui-ux',
    'graphic-design': 'graphic-design',
    photography: 'photography',
    'my-story': 'all',
    contact: 'all',
    'privacy-policy': 'all',
    'terms-and-conditions': 'all',
  };

  const currentCategory = categoryMap[page];
  const pageProjects = PROJECTS.filter((p) => p.category === currentCategory || currentCategory === 'all');

  return (
    <div className="pt-28 pb-32 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back to the doors breadcrumb */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>← Back to the doors.</span>
        </button>

        {/* Page Hero Header */}
        <div className="max-w-4xl mb-14">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-2">
            <span>DOOR {doorMeta?.number || '01'}</span>
            <span>·</span>
            <span>{doorMeta?.subtitle}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-neutral-950 dark:text-neutral-50 tracking-tight mb-6">
            {doorMeta?.title || 'Selected Works'}
          </h1>

          <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
            {doorMeta?.tagline}
          </p>

          {/* Key Skills */}
          <div className="flex flex-wrap gap-2">
            {doorMeta?.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs font-mono rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Specific Interactive Simulators for Web Development */}
        {page === 'web-development' && (
          <div className="mb-20 space-y-12">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Live Interactive Project Demos
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-950 dark:text-neutral-50 mb-6">
                Try the Real Calculators & Interfaces
              </h2>
            </div>

            {/* Quicko Capital Gains Tax Calculator */}
            <InteractiveTaxCalculator />

            {/* Zerodha P&L Terminal Preview */}
            <InteractiveZerodhaPreview />

            {/* Sandbox Tax API Cost Calculator */}
            <InteractiveApiCostCalculator />
          </div>
        )}

        {/* Projects Grid for this skill */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-neutral-950 dark:text-neutral-50">
              Case Studies & Deliverables
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              {pageProjects.length} Selected Projects
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(p) => setSelectedModalProject(p)}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA & Return to Doors */}
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-display font-bold text-neutral-950 dark:text-neutral-50 mb-1">
              Need expertise in {doorMeta?.title}?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Let's talk about your roadmap, requirements, and timeline.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onBack}
              className="px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              ← Back to the doors
            </button>
            <button
              onClick={onContactClick}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-950 dark:bg-white dark:text-neutral-950 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>

      {/* Case Study Modal */}
      <ProjectModal
        project={selectedModalProject}
        onClose={() => setSelectedModalProject(null)}
      />
    </div>
  );
}

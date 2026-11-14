import { useEffect } from 'react';
import { X, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectProject?: (project: Project) => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-neutral-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            <span>{project.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            {project.client && (
              <>
                <span aria-hidden="true">·</span>
                <span>{project.client}</span>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close case study modal"
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Title & Subtitle */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-950 dark:text-neutral-50 mb-2">
              {project.title}
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-300">
              {project.subtitle}
            </p>
          </div>

          {/* Hero Media Showcase Container */}
          <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950">
            <img
              src={project.image}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Metrics Strip (if available) */}
          {project.stats && project.stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              {project.stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold font-display text-neutral-950 dark:text-neutral-50 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Narrative Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                The Challenge
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {project.challenge}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                The Solution & Engineering
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Deliverables & Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                Key Deliverables
              </h3>
              <ul className="space-y-2">
                {project.deliverables.map((del) => (
                  <li key={del} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                Technologies & Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs font-mono font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {project.liveUrl && (
                <div className="mt-6">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <span>Visit Live Application</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Work by Rishi Thakor
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close Case Study
          </button>
        </div>
      </div>
    </div>
  );
}

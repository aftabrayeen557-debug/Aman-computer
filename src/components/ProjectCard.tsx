import { ArrowUpRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  featuredLayout?: boolean;
}

export default function ProjectCard({ project, onSelect, featuredLayout = false }: ProjectCardProps) {
  return (
    <article
      onClick={() => onSelect(project)}
      className={`group relative rounded-2xl md:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 flex flex-col ${
        featuredLayout ? 'lg:col-span-2' : ''
      }`}
    >
      {/* Media Window */}
      <div className="relative aspect-16/10 overflow-hidden bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <img
          src={project.image}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-103"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900/90 backdrop-blur-xs rounded-xl shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <span>Read Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
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

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mb-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors flex items-center justify-between">
            <span>{project.title}</span>
            <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-neutral-100 transition-colors shrink-0" />
          </h3>

          {/* Subtitle / summary */}
          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed mb-5">
            {project.subtitle}
          </p>
        </div>

        {/* Bottom Tech & Deliverables inline row */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2 font-mono">
            {project.tags.slice(0, 3).join(' · ')}
          </div>
          {project.stats && project.stats[0] && (
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
              {project.stats[0].value}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

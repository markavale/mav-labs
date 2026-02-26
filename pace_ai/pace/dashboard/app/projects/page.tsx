import { ProjectCard } from '@/components/projects/project-card';
import { mockProjects } from '@/lib/mock-data';

export default function ProjectsPage() {
  const activeProjects = mockProjects.filter((p) => p.status !== 'archived');
  const archivedProjects = mockProjects.filter((p) => p.status === 'archived');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects Hub</h1>
          <p className="text-text-secondary mt-1">
            Overview of all active projects with drill-down
          </p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Active Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>

      {/* Archived Projects */}
      {archivedProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-muted mb-4">Archived</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

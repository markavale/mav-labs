import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/projects/project-detail';
import { mockProjects } from '@/lib/mock-data';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = mockProjects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <ProjectDetail project={project} />
    </div>
  );
}

export async function generateStaticParams() {
  return mockProjects.map((project) => ({
    slug: project.slug,
  }));
}

import { Project, ProjectStatus, statusColors, statusLabels } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectPipelineProps {
  projects: Project[];
  className?: string;
}

const stages: ProjectStatus[] = ['discovery', 'design', 'development', 'review', 'published'];

export function ProjectPipeline({ projects, className }: ProjectPipelineProps) {
  const getProjectCount = (status: ProjectStatus) => {
    return projects.filter((p) => p.status === status).length;
  };

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 animate-slide-up', className)}>
      <h3 className="font-display font-semibold text-lg mb-6">Project Pipeline</h3>
      
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => {
          const count = getProjectCount(stage);
          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex-1 text-center">
                <div
                  className={cn(
                    'mx-auto mb-2 w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg',
                    statusColors[stage]
                  )}
                >
                  {count}
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {statusLabels[stage]}
                </p>
              </div>
              {index < stages.length - 1 && (
                <div className="w-8 h-0.5 bg-border -mt-6" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

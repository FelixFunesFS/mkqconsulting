import { Project } from '@/types/project';
import { StatsCard } from './StatsCard';
import { ProjectCard } from './ProjectCard';
import { ProjectPipeline } from './ProjectPipeline';
import { DraggableProjectGrid } from './DraggableProjectGrid';
import { useAllProjectRevenues } from '@/hooks/useProjectRevenues';
import { 
  Globe, 
  Code2, 
  DollarSign, 
  TrendingUp,
  Clock,
  Banknote
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onViewQuestionnaire: (project: Project) => void;
  onViewTasks: (project: Project) => void;
  onViewDocuments: (project: Project) => void;
}

export function Dashboard({ 
  projects, 
  onProjectClick, 
  onEditProject, 
  onViewQuestionnaire,
  onViewTasks,
  onViewDocuments,
}: DashboardProps) {
  const { data: allRevenues = [] } = useAllProjectRevenues();
  
  const publishedProjects = projects.filter((p) => p.status === 'published');
  const inDevelopment = projects.filter((p) => p.status !== 'published');
  
  // Calculate revenue totals from the new project_revenues table
  const totalMonthlyRecurring = allRevenues
    .filter((r) => r.type === 'monthly' && r.is_active)
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const totalOneTime = allRevenues
    .filter((r) => r.type === 'one_time')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your web development projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Published Sites"
          value={publishedProjects.length}
          subtitle="Live websites"
          icon={Globe}
          variant="success"
        />
        <StatsCard
          title="In Development"
          value={inDevelopment.length}
          subtitle="Active projects"
          icon={Code2}
          variant="primary"
        />
        <StatsCard
          title="Monthly Recurring"
          value={`$${totalMonthlyRecurring}`}
          subtitle="Active subscriptions"
          icon={DollarSign}
          variant="accent"
        />
        <StatsCard
          title="One-Time Revenue"
          value={`$${totalOneTime}`}
          subtitle="Total collected"
          icon={Banknote}
          variant="default"
        />
      </div>

      {/* Pipeline */}
      <ProjectPipeline projects={projects} />

      {/* Projects Grid */}
      <div className="space-y-6">
        {/* In Development - Draggable */}
        {inDevelopment.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">In Development</h2>
              <span className="text-sm text-muted-foreground">({inDevelopment.length})</span>
              <span className="text-xs text-muted-foreground ml-2">• Drag to reorder</span>
            </div>
            <DraggableProjectGrid
              projects={inDevelopment}
              onProjectClick={onProjectClick}
              onEditProject={onEditProject}
              onViewQuestionnaire={onViewQuestionnaire}
              onViewTasks={onViewTasks}
              onViewDocuments={onViewDocuments}
            />
          </div>
        )}

        {/* Published */}
        {publishedProjects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success" />
              <h2 className="font-display text-xl font-semibold">Published & Earning</h2>
              <span className="text-sm text-muted-foreground">({publishedProjects.length})</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {publishedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => onViewTasks(project)}
                  onEdit={() => onEditProject(project)}
                  onViewQuestionnaire={() => onViewQuestionnaire(project)}
                  onViewTasks={() => onViewTasks(project)}
                  onViewDocuments={() => onViewDocuments(project)}
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

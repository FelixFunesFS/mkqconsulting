import { Project, statusColors, statusLabels } from '@/types/project';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, MoreHorizontal, CheckCircle2, ListTodo, UserPlus, User, FileText, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClients } from '@/hooks/useClients';
import { useUpdateProject } from '@/hooks/useProjects';
import { useProjectRevenues } from '@/hooks/useProjectRevenues';
import { useProjectClients, useAddProjectClient, useRemoveProjectClient } from '@/hooks/useProjectClients';
import { useToast } from '@/hooks/use-toast';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onEdit?: () => void;
  onViewQuestionnaire?: () => void;
  onViewTasks?: () => void;
  onViewDocuments?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProjectCard({
  project,
  onClick,
  onEdit,
  onViewQuestionnaire,
  onViewTasks,
  onViewDocuments,
  className,
  style,
}: ProjectCardProps) {
  const { data: clients } = useClients();
  const { data: revenues = [] } = useProjectRevenues(project.id);
  const { data: projectClients } = useProjectClients(project.id);
  const addProjectClient = useAddProjectClient();
  const removeProjectClient = useRemoveProjectClient();
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  
  const linkedClients = clients?.filter(c => projectClients?.some(pc => pc.clientId === c.id)) ?? [];
  
  // Calculate revenue totals
  const activeMonthlyTotal = revenues
    .filter((r) => r.type === 'monthly' && r.status === 'active')
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const pendingMonthlyTotal = revenues
    .filter((r) => r.type === 'monthly' && r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const oneTimeTotal = revenues
    .filter((r) => r.type === 'one_time')
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const hasRevenue = activeMonthlyTotal > 0 || pendingMonthlyTotal > 0 || oneTimeTotal > 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAssignClient = async (clientId: string | null) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        clientId: clientId || undefined,
      });
      const clientName = clients?.find(c => c.id === clientId)?.name;
      toast({
        title: clientId ? 'Client assigned' : 'Client unassigned',
        description: clientId 
          ? `${clientName} can now access this project in their portal.`
          : 'This project is no longer linked to a client.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update client assignment',
        variant: 'destructive'
      });
    }
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-5 card-hover cursor-pointer animate-slide-up',
        className
      )}
      style={style}
      onClick={onClick}
    >
      {/* Status badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs font-medium', statusColors[project.status])}>
            {statusLabels[project.status]}
          </Badge>
          {linkedClient && (
            <Badge variant="outline" className="text-xs gap-1">
              <User className="h-3 w-3" />
              {linkedClient.name}
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewTasks?.(); }}>
              <ListTodo className="mr-2 h-4 w-4" />
              View Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDocuments?.(); }}>
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewQuestionnaire?.(); }}>
              View Questionnaire
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Client
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); handleAssignClient(null); }}
                  className={!project.clientId ? 'bg-accent' : ''}
                >
                  <span className="text-muted-foreground">No client</span>
                </DropdownMenuItem>
                {clients?.map((client) => (
                  <DropdownMenuItem
                    key={client.id}
                    onClick={(e) => { e.stopPropagation(); handleAssignClient(client.id); }}
                    className={project.clientId === client.id ? 'bg-accent' : ''}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      {client.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
              Edit Project
            </DropdownMenuItem>
            {project.websiteUrl && (
              <DropdownMenuItem asChild>
                <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  Visit Site <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Business info */}
      <div className="mb-4">
        <h3 className="font-display font-semibold text-lg mb-1 line-clamp-1">
          {project.businessName}
        </h3>
        <p className="text-sm text-muted-foreground">{project.clientName}</p>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
      </div>

      {/* Tasks */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          <span>{project.tasksCompleted}/{project.totalTasks} tasks</span>
        </div>
        {project.targetLaunchDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.targetLaunchDate)}</span>
          </div>
        )}
      </div>

      {/* Revenue section */}
      {hasRevenue && (
        <div className="pt-3 border-t border-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-default">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <div className="flex items-center gap-2">
                    {activeMonthlyTotal > 0 && (
                      <span className="font-display font-semibold text-success">
                        ${activeMonthlyTotal}/mo
                      </span>
                    )}
                    {pendingMonthlyTotal > 0 && (
                      <span className="flex items-center gap-1 text-sm text-warning">
                        <Clock className="h-3 w-3" />
                        +${pendingMonthlyTotal}
                      </span>
                    )}
                    {oneTimeTotal > 0 && (
                      <span className="text-sm text-muted-foreground">
                        + ${oneTimeTotal}
                      </span>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2 text-xs">
                  {revenues.filter(r => r.type === 'monthly' && r.status === 'active').length > 0 && (
                    <div className="space-y-1">
                      <div className="font-medium text-success">Active Monthly</div>
                      {revenues.filter(r => r.type === 'monthly' && r.status === 'active').map((r) => (
                        <div key={r.id} className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{r.description || 'Monthly'}</span>
                          <span>${Number(r.amount)}/mo</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {revenues.filter(r => r.type === 'monthly' && r.status === 'pending').length > 0 && (
                    <div className="space-y-1">
                      <div className="font-medium text-warning">Pending Monthly</div>
                      {revenues.filter(r => r.type === 'monthly' && r.status === 'pending').map((r) => (
                        <div key={r.id} className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{r.description || 'Monthly'}</span>
                          <span>${Number(r.amount)}/mo</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {revenues.filter(r => r.type === 'one_time').length > 0 && (
                    <div className="space-y-1">
                      <div className="font-medium">One-Time</div>
                      {revenues.filter(r => r.type === 'one_time').map((r) => (
                        <div key={r.id} className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{r.description || 'One-time'}</span>
                          <span>${Number(r.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableProjectCardProps {
  project: Project;
  onClick?: () => void;
  onEdit?: () => void;
  onViewQuestionnaire?: () => void;
  onViewTasks?: () => void;
  onViewDocuments?: () => void;
}

export function DraggableProjectCard({
  project,
  onClick,
  onEdit,
  onViewQuestionnaire,
  onViewTasks,
  onViewDocuments,
}: DraggableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group/drag',
        isDragging && 'z-50 opacity-90'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <ProjectCard
        project={project}
        onClick={onClick}
        onEdit={onEdit}
        onViewQuestionnaire={onViewQuestionnaire}
        onViewTasks={onViewTasks}
        onViewDocuments={onViewDocuments}
        className={cn(
          'pl-8',
          isDragging && 'ring-2 ring-primary shadow-lg'
        )}
      />
    </div>
  );
}

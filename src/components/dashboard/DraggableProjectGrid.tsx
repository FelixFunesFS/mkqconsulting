import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Project } from '@/types/project';
import { DraggableProjectCard } from './DraggableProjectCard';
import { useUpdateProjectOrder } from '@/hooks/useProjects';
import { toast } from 'sonner';

interface DraggableProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onViewQuestionnaire: (project: Project) => void;
  onViewTasks: (project: Project) => void;
}

export function DraggableProjectGrid({
  projects,
  onProjectClick,
  onEditProject,
  onViewQuestionnaire,
  onViewTasks,
}: DraggableProjectGridProps) {
  const [items, setItems] = useState(projects);
  const updateOrder = useUpdateProjectOrder();

  // Update local items when projects prop changes
  if (projects.length !== items.length || 
      projects.some((p, i) => p.id !== items[i]?.id)) {
    setItems(projects);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Persist the new order
      const orders = newItems.map((item, index) => ({
        id: item.id,
        displayOrder: index,
      }));

      updateOrder.mutate(orders, {
        onError: () => {
          // Revert on error
          setItems(items);
          toast.error('Failed to save project order');
        },
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((project) => (
            <DraggableProjectCard
              key={project.id}
              project={project}
              onClick={() => onViewTasks(project)}
              onEdit={() => onEditProject(project)}
              onViewQuestionnaire={() => onViewQuestionnaire(project)}
              onViewTasks={() => onViewTasks(project)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

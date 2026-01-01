import { useActivities, useDeleteActivity, useUpdateActivityVisibility } from '@/hooks/useActivities';
import { ActivityItem } from './ActivityItem';
import { Loader2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityTimelineProps {
  projectId: string;
  isAdmin?: boolean;
  maxHeight?: string;
  limit?: number;
}

export function ActivityTimeline({ projectId, isAdmin, maxHeight = '400px', limit }: ActivityTimelineProps) {
  const { data: activities = [], isLoading } = useActivities(projectId);
  const deleteActivity = useDeleteActivity();
  const updateVisibility = useUpdateActivityVisibility();
  const { toast } = useToast();

  const displayedActivities = limit ? activities.slice(0, limit) : activities;

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity.mutateAsync({ id, projectId });
      toast({ title: 'Activity deleted' });
    } catch (error) {
      toast({ title: 'Failed to delete activity', variant: 'destructive' });
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      await updateVisibility.mutateAsync({ id, projectId, visibleToClient: visible });
      toast({ title: visible ? 'Now visible to client' : 'Hidden from client' });
    } catch (error) {
      toast({ title: 'Failed to update visibility', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (displayedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <History className="h-8 w-8 mb-2" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-0">
        {displayedActivities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

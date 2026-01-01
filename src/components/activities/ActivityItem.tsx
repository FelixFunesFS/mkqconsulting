import { Activity, activityTypeConfig } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileUp, FileX, ListPlus, CheckCircle, RefreshCw, 
  FileEdit, FolderKanban, StickyNote, Trash2, Eye, EyeOff 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const iconMap = {
  FileUp,
  FileX,
  ListPlus,
  CheckCircle,
  RefreshCw,
  FileEdit,
  FolderKanban,
  StickyNote,
};

interface ActivityItemProps {
  activity: Activity;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, visible: boolean) => void;
}

export function ActivityItem({ activity, isAdmin, onDelete, onToggleVisibility }: ActivityItemProps) {
  const config = activityTypeConfig[activity.activityType];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap];

  return (
    <div className="flex gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={cn('mt-0.5 p-2 rounded-full bg-muted', config.color)}>
        <IconComponent className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
            )}
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onToggleVisibility?.(activity.id, !activity.visibleToClient)}
                title={activity.visibleToClient ? 'Hide from client' : 'Show to client'}
              >
                {activity.visibleToClient ? (
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(activity.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{activity.userName || activity.userEmail || 'System'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
          {isAdmin && !activity.visibleToClient && (
            <>
              <span>•</span>
              <span className="text-amber-500">Hidden from client</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

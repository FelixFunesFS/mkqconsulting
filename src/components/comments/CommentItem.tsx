import { useState } from 'react';
import { Comment } from '@/types/comment';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Edit2, Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  isAdmin?: boolean;
  onUpdate?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, visible: boolean) => void;
}

export function CommentItem({ 
  comment, 
  currentUserId, 
  isAdmin, 
  onUpdate, 
  onDelete,
  onToggleVisibility 
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const isOwner = comment.userId === currentUserId;
  const canModify = isOwner || isAdmin;
  const initials = (comment.userName || comment.userEmail || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onUpdate?.(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={cn(
      "flex gap-3 py-3",
      !comment.visibleToClient && isAdmin && "opacity-60"
    )}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.userName || comment.userEmail || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {isAdmin && !comment.visibleToClient && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <EyeOff className="h-3 w-3" /> Hidden
              </span>
            )}
          </div>
          
          {canModify && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem 
                    onClick={() => onToggleVisibility?.(comment.id, !comment.visibleToClient)}
                  >
                    {comment.visibleToClient ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" /> Hide from client
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" /> Show to client
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canModify && (
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/useComments';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CommentThreadProps {
  projectId: string;
  taskId?: string | null;
  isAdmin?: boolean;
  maxHeight?: string;
}

export function CommentThread({ projectId, taskId, isAdmin, maxHeight = '400px' }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [visibleToClient, setVisibleToClient] = useState(true);
  
  const { data: comments = [], isLoading } = useComments(projectId, taskId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const { toast } = useToast();

  // Subscribe to realtime updates
  useRealtimeSubscription({
    table: 'comments',
    projectId,
    queryKey: ['comments', projectId, taskId],
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        projectId,
        taskId,
        content: newComment.trim(),
        visibleToClient: isAdmin ? visibleToClient : true,
      });
      setNewComment('');
      toast({ title: 'Comment added' });
    } catch (error) {
      toast({ title: 'Failed to add comment', variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: string, content: string) => {
    try {
      await updateComment.mutateAsync({ id, projectId, taskId, content });
      toast({ title: 'Comment updated' });
    } catch (error) {
      toast({ title: 'Failed to update comment', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment.mutateAsync({ id, projectId, taskId });
      toast({ title: 'Comment deleted' });
    } catch (error) {
      toast({ title: 'Failed to delete comment', variant: 'destructive' });
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      await updateComment.mutateAsync({ id, projectId, taskId, visibleToClient: visible });
      toast({ title: visible ? 'Comment now visible to client' : 'Comment hidden from client' });
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

  return (
    <div className="flex flex-col h-full">
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground flex-1">
          <MessageCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">No comments yet</p>
          <p className="text-xs">Start the conversation</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden" style={{ maxHeight: maxHeight === '100%' ? undefined : maxHeight }}>
          <ScrollArea className="h-full">
            <div className="divide-y divide-border/50 pr-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUser?.id || ''}
                  isAdmin={isAdmin}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      <div className="border-t pt-4 mt-4 space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[80px] resize-none"
        />
        
        <div className="flex items-center justify-between">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Switch
                id="visible"
                checked={visibleToClient}
                onCheckedChange={setVisibleToClient}
              />
              <Label htmlFor="visible" className="text-sm text-muted-foreground">
                Visible to client
              </Label>
            </div>
          )}
          
          <Button 
            onClick={handleSubmit} 
            disabled={!newComment.trim() || createComment.isPending}
            className={!isAdmin ? 'ml-auto' : ''}
          >
            {createComment.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

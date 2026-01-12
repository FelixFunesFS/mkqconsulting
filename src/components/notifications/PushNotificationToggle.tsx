import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

interface PushNotificationToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function PushNotificationToggle({ 
  showLabel = true, 
  className = '' 
}: PushNotificationToggleProps) {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await subscribe();
      if (success) {
        toast.success('Push notifications enabled!');
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Please enable in browser settings.');
      } else {
        toast.error('Failed to enable notifications');
      }
    } else {
      const success = await unsubscribe();
      if (success) {
        toast.success('Push notifications disabled');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {isSubscribed ? (
        <Bell className="h-4 w-4 text-primary" />
      ) : (
        <BellOff className="h-4 w-4 text-muted-foreground" />
      )}
      
      {showLabel && (
        <Label htmlFor="push-toggle" className="flex-1 cursor-pointer">
          Push Notifications
        </Label>
      )}
      
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Switch
          id="push-toggle"
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={permission === 'denied'}
          aria-label="Toggle push notifications"
        />
      )}
    </div>
  );
}

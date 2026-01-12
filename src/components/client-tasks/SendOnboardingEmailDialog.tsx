import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendOnboardingEmailDialogProps {
  projectId: string;
  projectName: string;
  clientEmail: string;
  clientName: string;
  pendingTaskCount: number;
}

export function SendOnboardingEmailDialog({
  projectId,
  projectName,
  clientEmail,
  clientName,
  pendingTaskCount,
}: SendOnboardingEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const portalUrl = `https://www.mkqconsulting.com/portal`;
      
      const { data, error } = await supabase.functions.invoke("send-onboarding-email", {
        body: {
          projectId,
          clientEmail,
          clientName,
          projectName,
          portalUrl,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Onboarding email sent successfully!");
        setOpen(false);
      } else {
        toast.error(data?.message || "Failed to send email");
      }
    } catch (err: any) {
      console.error("Error sending onboarding email:", err);
      toast.error(err.message || "Failed to send onboarding email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Send Onboarding Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Onboarding Email</DialogTitle>
          <DialogDescription>
            Send an email to the client with their task checklist and portal access link.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Recipient</p>
              <p className="font-medium">{clientName}</p>
              <p className="text-muted-foreground">{clientEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Project</p>
              <p className="font-medium">{projectName}</p>
              <p className="text-muted-foreground">{pendingTaskCount} pending tasks</p>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Email includes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Welcome message</li>
              <li>Full task checklist grouped by category</li>
              <li>Direct link to client portal</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

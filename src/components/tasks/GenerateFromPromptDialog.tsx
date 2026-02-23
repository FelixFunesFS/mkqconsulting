import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';

interface GenerateFromPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export function GenerateFromPromptDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
}: GenerateFromPromptDialogProps) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt.trim());
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isGenerating) {
      setPrompt('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generate Tasks from Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="prompt">Paste your plan or content</Label>
            <Textarea
              id="prompt"
              placeholder="Paste your marketing plan, content calendar, strategy document, or any plan you want turned into tasks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[200px] resize-y"
              maxLength={10000}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground text-right">
              {prompt.length.toLocaleString()} / 10,000
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            AI will automatically categorize tasks into the appropriate phases (e.g., Content Strategy, Social Media, Paid Ads, etc.)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Tasks
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

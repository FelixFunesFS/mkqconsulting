import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { statusLabels as phaseLabels } from '@/types/project';

const phases = ['discovery', 'design', 'development', 'review', 'published'] as const;

interface GenerateFromPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string, phase: string) => void;
  isGenerating: boolean;
  defaultPhase?: string;
}

export function GenerateFromPromptDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  defaultPhase = 'discovery',
}: GenerateFromPromptDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState(defaultPhase);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt.trim(), phase);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isGenerating) {
      setPrompt('');
      setPhase(defaultPhase);
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

          <div className="space-y-2">
            <Label htmlFor="phase">Default phase for tasks</Label>
            <Select value={phase} onValueChange={setPhase} disabled={isGenerating}>
              <SelectTrigger id="phase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phases.map((p) => (
                  <SelectItem key={p} value={p}>
                    {phaseLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tasks will be assigned to this phase unless the content suggests otherwise.
            </p>
          </div>
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

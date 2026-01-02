import { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  useProjectRevenues,
  useAddRevenue,
  useUpdateRevenue,
  useDeleteRevenue,
  RevenueType,
  ProjectRevenue,
} from '@/hooks/useProjectRevenues';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RevenueManagerProps {
  projectId: string;
}

interface RevenueFormData {
  type: RevenueType;
  amount: string;
  description: string;
}

export function RevenueManager({ projectId }: RevenueManagerProps) {
  const { data: revenues = [], isLoading } = useProjectRevenues(projectId);
  const addRevenue = useAddRevenue();
  const updateRevenue = useUpdateRevenue();
  const deleteRevenue = useDeleteRevenue();
  const { toast } = useToast();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<RevenueType>('monthly');
  const [editingRevenue, setEditingRevenue] = useState<ProjectRevenue | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectRevenue | null>(null);
  const [formData, setFormData] = useState<RevenueFormData>({
    type: 'monthly',
    amount: '',
    description: '',
  });

  const monthlyRevenues = revenues.filter((r) => r.type === 'monthly');
  const oneTimeRevenues = revenues.filter((r) => r.type === 'one_time');
  const totalMonthly = monthlyRevenues
    .filter((r) => r.is_active)
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const totalOneTime = oneTimeRevenues.reduce((sum, r) => sum + Number(r.amount), 0);

  const openAddDialog = (type: RevenueType) => {
    setAddType(type);
    setFormData({ type, amount: '', description: '' });
    setShowAddDialog(true);
  };

  const openEditDialog = (revenue: ProjectRevenue) => {
    setEditingRevenue(revenue);
    setFormData({
      type: revenue.type,
      amount: revenue.amount.toString(),
      description: revenue.description || '',
    });
  };

  const handleAdd = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    try {
      await addRevenue.mutateAsync({
        project_id: projectId,
        type: addType,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
      });
      toast({ title: 'Revenue added' });
      setShowAddDialog(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingRevenue || !formData.amount) return;

    try {
      await updateRevenue.mutateAsync({
        id: editingRevenue.id,
        project_id: projectId,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
      });
      toast({ title: 'Revenue updated' });
      setEditingRevenue(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (revenue: ProjectRevenue) => {
    try {
      await updateRevenue.mutateAsync({
        id: revenue.id,
        project_id: projectId,
        is_active: !revenue.is_active,
      });
      toast({ title: revenue.is_active ? 'Revenue paused' : 'Revenue activated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteRevenue.mutateAsync({ id: deleteConfirm.id, project_id: projectId });
      toast({ title: 'Revenue deleted' });
      setDeleteConfirm(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Revenue Streams</Label>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openAddDialog('monthly')}>
            <Plus className="h-4 w-4 mr-1" />
            Monthly
          </Button>
          <Button size="sm" variant="outline" onClick={() => openAddDialog('one_time')}>
            <Plus className="h-4 w-4 mr-1" />
            One-Time
          </Button>
        </div>
      </div>

      {revenues.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
          No revenue entries yet. Add monthly or one-time revenue above.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Monthly Recurring */}
          {monthlyRevenues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                Monthly Recurring
              </div>
              <div className="space-y-2">
                {monthlyRevenues.map((revenue) => (
                  <div
                    key={revenue.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      revenue.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={revenue.is_active}
                        onCheckedChange={() => handleToggleActive(revenue)}
                      />
                      <div>
                        <span className="font-medium">${Number(revenue.amount).toFixed(0)}/mo</span>
                        {revenue.description && (
                          <span className="text-muted-foreground ml-2">— {revenue.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(revenue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteConfirm(revenue)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* One-Time */}
          {oneTimeRevenues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                One-Time
              </div>
              <div className="space-y-2">
                {oneTimeRevenues.map((revenue) => (
                  <div
                    key={revenue.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <span className="font-medium">${Number(revenue.amount).toFixed(0)}</span>
                      {revenue.description && (
                        <span className="text-muted-foreground ml-2">— {revenue.description}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(revenue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteConfirm(revenue)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Totals</span>
            <div className="flex gap-4">
              <Badge variant="secondary" className="font-mono">
                ${totalMonthly.toFixed(0)}/mo
              </Badge>
              {totalOneTime > 0 && (
                <Badge variant="outline" className="font-mono">
                  ${totalOneTime.toFixed(0)} one-time
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Add {addType === 'monthly' ? 'Monthly' : 'One-Time'} Revenue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder={addType === 'monthly' ? 'e.g., Hosting' : 'e.g., Initial Build'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={addRevenue.isPending}>
              {addRevenue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRevenue} onOpenChange={(open) => !open && setEditingRevenue(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Revenue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount ($)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRevenue(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateRevenue.isPending}>
              {updateRevenue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Revenue Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this revenue entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

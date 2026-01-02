import { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, DollarSign, Loader2, Clock, Pause, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  useProjectRevenues,
  useAddRevenue,
  useUpdateRevenue,
  useDeleteRevenue,
  RevenueType,
  RevenueStatus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RevenueManagerProps {
  projectId: string;
}

interface RevenueFormData {
  type: RevenueType;
  amount: string;
  description: string;
  status: RevenueStatus;
}

const STATUS_OPTIONS: { value: RevenueStatus; label: string; icon: typeof CheckCircle2; color: string }[] = [
  { value: 'active', label: 'Active', icon: CheckCircle2, color: 'text-success' },
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-warning' },
  { value: 'paused', label: 'Paused', icon: Pause, color: 'text-muted-foreground' },
];

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
    status: 'active',
  });

  const monthlyRevenues = revenues.filter((r) => r.type === 'monthly');
  const oneTimeRevenues = revenues.filter((r) => r.type === 'one_time');
  
  // Group monthly revenues by status
  const activeMonthly = monthlyRevenues.filter((r) => r.status === 'active');
  const pendingMonthly = monthlyRevenues.filter((r) => r.status === 'pending');
  const pausedMonthly = monthlyRevenues.filter((r) => r.status === 'paused');
  
  const totalActiveMonthly = activeMonthly.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalPendingMonthly = pendingMonthly.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalOneTime = oneTimeRevenues.reduce((sum, r) => sum + Number(r.amount), 0);

  const openAddDialog = (type: RevenueType) => {
    setAddType(type);
    setFormData({ type, amount: '', description: '', status: 'active' });
    setShowAddDialog(true);
  };

  const openEditDialog = (revenue: ProjectRevenue) => {
    setEditingRevenue(revenue);
    setFormData({
      type: revenue.type,
      amount: revenue.amount.toString(),
      description: revenue.description || '',
      status: revenue.status,
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
        status: formData.status,
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
        status: formData.status,
      });
      toast({ title: 'Revenue updated' });
      setEditingRevenue(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleStatusChange = async (revenue: ProjectRevenue, newStatus: RevenueStatus) => {
    try {
      await updateRevenue.mutateAsync({
        id: revenue.id,
        project_id: projectId,
        status: newStatus,
        is_active: newStatus === 'active',
      });
      toast({ title: `Revenue ${newStatus}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: RevenueStatus) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    if (!option) return null;
    const Icon = option.icon;
    return <Icon className={`h-4 w-4 ${option.color}`} />;
  };

  const getStatusStyles = (status: RevenueStatus) => {
    switch (status) {
      case 'active':
        return 'bg-card border-success/20';
      case 'pending':
        return 'bg-warning/5 border-warning/30';
      case 'paused':
        return 'bg-muted/50 opacity-60';
      default:
        return 'bg-card';
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
          {/* Monthly Recurring - Active */}
          {activeMonthly.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                Active Monthly
              </div>
              <div className="space-y-2">
                {activeMonthly.map((revenue) => (
                  <RevenueItem
                    key={revenue.id}
                    revenue={revenue}
                    getStatusStyles={getStatusStyles}
                    getStatusIcon={getStatusIcon}
                    onStatusChange={handleStatusChange}
                    onEdit={openEditDialog}
                    onDelete={setDeleteConfirm}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Monthly Recurring - Pending */}
          {pendingMonthly.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-warning">
                <Clock className="h-4 w-4" />
                Pending Monthly
              </div>
              <div className="space-y-2">
                {pendingMonthly.map((revenue) => (
                  <RevenueItem
                    key={revenue.id}
                    revenue={revenue}
                    getStatusStyles={getStatusStyles}
                    getStatusIcon={getStatusIcon}
                    onStatusChange={handleStatusChange}
                    onEdit={openEditDialog}
                    onDelete={setDeleteConfirm}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Monthly Recurring - Paused */}
          {pausedMonthly.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Pause className="h-4 w-4" />
                Paused Monthly
              </div>
              <div className="space-y-2">
                {pausedMonthly.map((revenue) => (
                  <RevenueItem
                    key={revenue.id}
                    revenue={revenue}
                    getStatusStyles={getStatusStyles}
                    getStatusIcon={getStatusIcon}
                    onStatusChange={handleStatusChange}
                    onEdit={openEditDialog}
                    onDelete={setDeleteConfirm}
                  />
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
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Monthly</span>
              <Badge variant="secondary" className="font-mono bg-success/10 text-success border-success/20">
                ${totalActiveMonthly.toFixed(0)}/mo
              </Badge>
            </div>
            {totalPendingMonthly > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending Monthly</span>
                <Badge variant="outline" className="font-mono text-warning border-warning/30">
                  +${totalPendingMonthly.toFixed(0)}/mo
                </Badge>
              </div>
            )}
            {totalOneTime > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">One-Time Total</span>
                <Badge variant="outline" className="font-mono">
                  ${totalOneTime.toFixed(0)}
                </Badge>
              </div>
            )}
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
            {addType === 'monthly' && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: RevenueStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
            {editingRevenue?.type === 'monthly' && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: RevenueStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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

// Extracted RevenueItem component for reuse
interface RevenueItemProps {
  revenue: ProjectRevenue;
  getStatusStyles: (status: RevenueStatus) => string;
  getStatusIcon: (status: RevenueStatus) => React.ReactNode;
  onStatusChange: (revenue: ProjectRevenue, status: RevenueStatus) => void;
  onEdit: (revenue: ProjectRevenue) => void;
  onDelete: (revenue: ProjectRevenue) => void;
}

function RevenueItem({ revenue, getStatusStyles, getStatusIcon, onStatusChange, onEdit, onDelete }: RevenueItemProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusStyles(revenue.status)}`}>
      <div className="flex items-center gap-3">
        <Select
          value={revenue.status}
          onValueChange={(value: RevenueStatus) => onStatusChange(revenue, value)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <span className="flex items-center gap-2">
              {getStatusIcon(revenue.status)}
              <span className="capitalize">{revenue.status}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div>
          <span className="font-medium">${Number(revenue.amount).toFixed(0)}/mo</span>
          {revenue.description && (
            <span className="text-muted-foreground ml-2">— {revenue.description}</span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(revenue)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(revenue)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

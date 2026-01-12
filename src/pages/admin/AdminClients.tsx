import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useClients, useCreateClient, useDeleteClient, Client } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { ClientProjectsDialog } from '@/components/projects/ClientProjectsDialog';
import { ClientLogoUploader } from '@/components/clients/ClientLogoUploader';
import { ClientEditDialog } from '@/components/clients/ClientEditDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  MoreHorizontal,
  Trash2,
  User,
  FolderKanban,
  Loader2,
  AlertTriangle,
  ImagePlus,
  Pencil
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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

export default function AdminClients() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    notes: ''
  });

  const [manageProjectsClient, setManageProjectsClient] = useState<Client | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<Client | null>(null);
  const [uploadLogoClient, setUploadLogoClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: projects } = useProjects();
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();

  const getClientProjects = (clientId: string) => {
    return projects?.filter(p => (p as any).clientId === clientId) || [];
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least a name and email.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createClient.mutateAsync(newClient);
      toast({
        title: 'Client created',
        description: `${newClient.name} has been added to your clients.`
      });
      setCreateDialogOpen(false);
      setNewClient({ name: '', email: '', companyName: '', phone: '', notes: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClient = async (client: Client) => {
    const clientProjects = getClientProjects(client.id);
    if (clientProjects.length > 0) {
      setDeleteConfirmClient(client);
      return;
    }
    await confirmDeleteClient(client);
  };

  const confirmDeleteClient = async (client: Client) => {
    try {
      await deleteClient.mutateAsync(client.id);
      toast({
        title: 'Client deleted',
        description: `${client.name} has been removed.`
      });
      setDeleteConfirmClient(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete client',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Clients</h1>
              <p className="text-muted-foreground mt-1">
                Manage your client relationships
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Client List */}
          {clientsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clients?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first client to get started
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients?.map((client) => {
                const clientProjects = getClientProjects(client.id);
                
                return (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={client.logoUrl || undefined} alt={client.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {client.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{client.name}</CardTitle>
                            {client.companyName && (
                              <CardDescription className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {client.companyName}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => setEditClient(client)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setUploadLogoClient(client)}
                            >
                              <ImagePlus className="h-4 w-4 mr-2" />
                              Upload Logo
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setManageProjectsClient(client)}
                            >
                              <FolderKanban className="h-4 w-4 mr-2" />
                              Manage Projects
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClient(client)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''}
                        </span>
                        {client.userId && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Portal Active
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Client Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the client's details. They'll receive an invitation to access their project portal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={newClient.companyName}
                onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClient} disabled={createClient.isPending}>
              {createClient.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Projects Dialog */}
      <ClientProjectsDialog
        client={manageProjectsClient}
        open={!!manageProjectsClient}
        onOpenChange={(open) => !open && setManageProjectsClient(null)}
      />

      {/* Upload Logo Dialog */}
      <Dialog open={!!uploadLogoClient} onOpenChange={(open) => !open && setUploadLogoClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Client Logo</DialogTitle>
            <DialogDescription>
              Upload a brand logo for {uploadLogoClient?.name}. This will appear in their client portal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {uploadLogoClient && (
              <ClientLogoUploader
                clientId={uploadLogoClient.id}
                currentLogoUrl={uploadLogoClient.logoUrl}
                clientName={uploadLogoClient.name}
                size="lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmClient} onOpenChange={(open) => !open && setDeleteConfirmClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Client Has Assigned Projects
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmClient?.name} has {getClientProjects(deleteConfirmClient?.id || '').length} project(s) assigned. 
              Deleting this client will unassign them from those projects. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmClient && confirmDeleteClient(deleteConfirmClient)}
            >
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Client Dialog */}
      <ClientEditDialog
        client={editClient}
        open={!!editClient}
        onOpenChange={(open) => !open && setEditClient(null)}
      />
    </div>
  );
}

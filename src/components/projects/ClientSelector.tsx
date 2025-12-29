import { useState } from 'react';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useClients, Client } from '@/hooks/useClients';

interface ClientSelectorProps {
  value?: string;
  onSelect: (clientId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ClientSelector({ 
  value, 
  onSelect, 
  placeholder = "Select client...",
  disabled = false 
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: clients, isLoading } = useClients();

  const selectedClient = clients?.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between"
        >
          {selectedClient ? (
            <span className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {selectedClient.name.charAt(0).toUpperCase()}
              </div>
              {selectedClient.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search clients..." />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onSelect(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-muted-foreground">No client assigned</span>
              </CommandItem>
              {clients?.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onSelect(client.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      {client.companyName && (
                        <div className="text-xs text-muted-foreground">{client.companyName}</div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

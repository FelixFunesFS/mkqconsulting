import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useClients } from '@/hooks/useClients';

interface MultiClientSelectorProps {
  value: string[];
  onChange: (clientIds: string[]) => void;
  disabled?: boolean;
}

export function MultiClientSelector({ value, onChange, disabled = false }: MultiClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: clients, isLoading } = useClients();

  const selectedClients = clients?.filter((c) => value.includes(c.id)) ?? [];

  const handleToggle = (clientId: string) => {
    if (value.includes(clientId)) {
      onChange(value.filter((id) => id !== clientId));
    } else {
      onChange([...value, clientId]);
    }
  };

  const handleRemove = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== clientId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between min-h-[40px] h-auto"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedClients.length === 0 ? (
              <span className="text-muted-foreground">Select clients...</span>
            ) : (
              selectedClients.map((client) => (
                <Badge key={client.id} variant="secondary" className="text-xs gap-1">
                  {client.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemove(client.id, e)}
                  />
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search clients..." />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {clients?.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => handleToggle(client.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(client.id) ? 'opacity-100' : 'opacity-0'
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

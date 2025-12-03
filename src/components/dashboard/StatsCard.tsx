import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30',
  accent: 'bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30',
  success: 'bg-gradient-to-br from-success/20 to-success/5 border-success/30',
};

const iconStyles = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary/20 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/20 text-success',
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 card-hover animate-slide-up',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={cn(
                  'font-medium',
                  trend.value >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

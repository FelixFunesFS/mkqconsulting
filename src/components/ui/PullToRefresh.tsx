import { ReactNode } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const isMobile = useIsMobile();
  const { containerRef, pullDistance, isRefreshing, isAtThreshold } = usePullToRefresh({
    onRefresh,
  });

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef} 
      className={cn("relative overflow-auto", className)}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none z-10",
          pullDistance > 10 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: 0,
          height: `${Math.max(pullDistance, isRefreshing ? 50 : 0)}px`,
          transform: isRefreshing ? 'none' : `translateY(-${60 - pullDistance}px)`,
        }}
      >
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          {isRefreshing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs">Refreshing...</span>
            </>
          ) : (
            <>
              <ArrowDown
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isAtThreshold && "rotate-180 text-primary"
                )}
              />
              <span className="text-xs">
                {isAtThreshold ? "Release to refresh" : "Pull to refresh"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? 50 : 0) : 0}px)`,
          transition: pullDistance === 0 && !isRefreshing ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

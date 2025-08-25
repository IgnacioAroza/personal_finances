'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]', sizeClasses[size], className)} role="status">
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function LoadingState({ message = 'Cargando...', showRetry = false, onRetry }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" className="text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">{message}</h2>
          <p className="text-sm text-muted-foreground">
            Por favor espera un momento...
          </p>
        </div>
        {showRetry && onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

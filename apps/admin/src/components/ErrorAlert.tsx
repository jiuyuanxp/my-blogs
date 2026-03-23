import { cn } from '@blog/utils';

export type ErrorAlertVariant = 'page' | 'compact';

export function ErrorAlert({
  message,
  variant = 'page',
  className,
}: {
  message: string;
  variant?: ErrorAlertVariant;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-red-50 border border-red-200 text-red-700 text-sm',
        variant === 'page' && 'px-4 py-3 rounded-xl',
        variant === 'compact' && 'px-4 py-2 rounded-lg',
        className
      )}
      role="alert"
    >
      {message}
    </div>
  );
}

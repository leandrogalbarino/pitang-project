interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <p className={`text-center py-10 text-slate-500 ${className}`}>
      {message}
    </p>
  );
}

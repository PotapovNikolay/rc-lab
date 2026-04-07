type StatusIndicatorProps = {
  label: string;
  value: string;
  status: 'ok' | 'error' | 'unknown';
};

const statusClasses: Record<StatusIndicatorProps['status'], string> = {
  ok: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  error: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  unknown: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
};

export function StatusIndicator({ label, value, status }: StatusIndicatorProps) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs sm:text-sm ${statusClasses[status]}`}
    >
      <p className="uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

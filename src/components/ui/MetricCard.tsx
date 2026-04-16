import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  alert?: boolean;
  warning?: boolean;
  hero?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  iconBg = 'bg-primary/10',
  alert = false,
  warning = false,
  hero = false,
  children,
  className = '',
}: MetricCardProps) {
  const cardBg = alert
    ? 'bg-red-50 border-red-200'
    : warning
    ? 'bg-amber-50 border-amber-200' :'bg-white border-border';

  const trendColor =
    trend === undefined
      ? ''
      : trend > 0
      ? 'text-emerald-600'
      : trend < 0
      ? 'text-red-500' :'text-muted-foreground';

  const TrendIcon =
    trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div
      className={`rounded-xl border p-4 shadow-card transition-shadow duration-200 hover:shadow-card-hover ${cardBg} ${hero ? 'p-5' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-semibold uppercase tracking-widest ${alert ? 'text-red-500' : warning ? 'text-amber-600' : 'text-muted-foreground'} mb-1`}>
            {label}
          </p>
          <p className={`font-bold tabular-nums leading-none ${hero ? 'text-4xl' : 'text-2xl'} ${alert ? 'text-red-700' : 'text-foreground'}`}>
            {value}
          </p>
          {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
          {(trend !== undefined || trendLabel) && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
              {TrendIcon && <TrendIcon size={13} />}
              <span>
                {trend !== undefined && `${trend > 0 ? '+' : ''}${trend}% `}
                {trendLabel && <span className="text-muted-foreground font-normal">{trendLabel}</span>}
              </span>
            </div>
          )}
        </div>
        <div className={`${iconBg} p-2.5 rounded-lg shrink-0`}>{icon}</div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
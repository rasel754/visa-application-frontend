"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  accentClass?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentClass = "bg-blue-50 text-blue-700",
}: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClass}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}


"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function LiveServerTime() {
  const [serverTime, setServerTime] = useState<Date | null>(null);

  useEffect(() => {
    setServerTime(new Date());
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = serverTime
    ? format(serverTime, "dd-MMM-yy HH:mm 'BD'")
    : "15-Nov-26 15:26 BD";

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Live DB Sync
      </span>
      <span className="text-slate-300">|</span>
      <span className="font-mono text-slate-600">
        Server Time: {formatted}
      </span>
    </div>
  );
}

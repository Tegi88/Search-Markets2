"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function SectionLoading() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted">
      <Loader2 className="animate-spin" size={16} />
      {t("loading")}
    </div>
  );
}

export function SectionError({ message }: { message: string }) {
  return <div className="p-6 text-sm text-down">{message}</div>;
}

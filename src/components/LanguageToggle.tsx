"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm text-muted hover:text-accent"
      aria-label="Toggle language"
      title={lang === "en" ? "עברית" : "English"}
    >
      <Languages size={14} />
      {lang === "en" ? "עברית" : "English"}
    </button>
  );
}

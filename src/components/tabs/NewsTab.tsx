"use client";

import type { NewsSection } from "@/lib/types";
import { useSection } from "@/lib/useSection";
import { SectionError, SectionLoading } from "@/components/SectionState";
import { formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function NewsTab({ symbol }: { symbol: string }) {
  const { t } = useLanguage();
  const { data, loading, error } = useSection<NewsSection>(symbol, "news");

  if (loading) return <SectionLoading />;
  if (error) return <SectionError message={error} />;
  if (!data) return null;

  if (data.news.length === 0) {
    return <div className="card p-6 text-sm text-muted">{t("noNews")}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {data.news.map((n, i) => (
        <a
          key={`${n.url}-${i}`}
          href={n.url}
          target="_blank"
          rel="noreferrer"
          className="card flex gap-3 p-4 hover:border-accent"
        >
          {n.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={n.image} alt="" className="h-20 w-20 shrink-0 rounded-md object-cover" />
          )}
          <div className="min-w-0">
            <h4 className="line-clamp-2 text-sm font-medium">{n.title}</h4>
            <p className="mt-1 text-xs text-muted">
              {n.site} · {formatDate(n.publishedDate)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

"use client";

export interface TabDef {
  id: string;
  label: string;
}

export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${
              active === tab.id
                ? "border-accent font-medium text-accent"
                : "border-transparent text-muted hover:text-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DebugPanel({ debug }: { debug?: Record<string, string> }) {
  if (!debug || Object.keys(debug).length === 0) return null;

  return (
    <div className="card border-down/30 p-4 text-xs">
      <p className="mb-2 font-medium text-down">Some data didn&apos;t load — details:</p>
      <div className="flex flex-col gap-1 font-mono text-muted">
        {Object.entries(debug).map(([key, msg]) => (
          <div key={key} className="break-all">
            <span className="text-down">{key}:</span> {msg}
          </div>
        ))}
      </div>
    </div>
  );
}

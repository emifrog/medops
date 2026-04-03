interface InfoSectionProps {
  icon: string;
  title: string;
  content: string;
  severity?: boolean;
}

function getSeverityBg(text: string | undefined): string {
  if (!text) return "bg-slate-700/40 border-slate-600/30";
  if (text.includes("URGENCE") || text.includes("ANTIDOTE") || text.includes("VITALE"))
    return "bg-red-950/60 border-red-500/40";
  if (text.includes("Attention") || text.includes("Risque") || text.includes("risque"))
    return "bg-amber-950/40 border-amber-500/30";
  return "bg-slate-800/50 border-slate-700/40";
}

export function InfoSection({ icon, title, content, severity }: InfoSectionProps) {
  const bg = severity
    ? getSeverityBg(content)
    : "bg-slate-800/50 border-slate-700/40";

  if (!content) return null;

  return (
    <section className={`rounded-xl border-2 p-4 ${bg}`} aria-label={title}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base" aria-hidden="true">{icon}</span>
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">
        {content}
      </p>
    </section>
  );
}

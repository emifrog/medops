"use client";

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  label?: string;
}

export function Toggle({ on, onToggle, label }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`w-12 h-7 rounded-full transition-all duration-200 flex items-center px-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${on ? "bg-amber-500" : "bg-slate-700"}`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

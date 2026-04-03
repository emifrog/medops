interface BadgeProps {
  children: React.ReactNode;
  color: string;
  small?: boolean;
}

export function Badge({ children, color, small }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border transition-colors duration-150 ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"}`}
      style={{
        backgroundColor: color + "18",
        borderColor: color + "40",
        color,
      }}
    >
      {children}
    </span>
  );
}

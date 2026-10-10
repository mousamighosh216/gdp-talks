export type Who = 'x' | 'd';

export const PEOPLE: Record<Who, { name: string; initials: string }> = {
  x: { name: 'Engineer X', initials: 'X' },
  d: { name: 'Doc D', initials: 'D' },
};

export default function Avatar({ who, className = 'h-10 w-10 text-sm' }: { who: Who; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-heading font-bold ${className} ${
        who === 'd' ? 'bg-gold-400 text-navy-950' : 'bg-navy-500 text-cream ring-2 ring-cream'
      }`}
      aria-hidden="true"
    >
      {PEOPLE[who].initials}
    </span>
  );
}

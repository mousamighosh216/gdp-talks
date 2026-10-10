import { Link } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="GDP Talks home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-400 text-navy-950">
        <MessageSquareText size={20} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span
        className={`font-heading text-xl font-bold tracking-tight ${
          light ? 'text-cream' : 'text-navy-950'
        }`}
      >
        GDP Talks
      </span>
    </Link>
  );
}

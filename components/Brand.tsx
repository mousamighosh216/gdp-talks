import Link from 'next/link';

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="GDP Talks home">
      <span className={`grid h-15 w-15 place-items-center rounded-xl text-navy-950 `}>
        <img src="./favicon.svg" alt="GDP" />
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

import Link from 'next/link';
import Image from 'next/image';

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="GDP Talks home">
      <span className={`grid h-auto w-auto place-items-center rounded-xl text-navy-950 `}>
        <Image src="/favicon.png" alt="GDP" width={60} height={60} />
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

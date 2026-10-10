import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-cream pt-16">
      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500">
          404
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-navy-950 sm:text-5xl">
          This page does not exist
        </h1>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-heading text-sm font-semibold text-navy-950 hover:bg-gold-200"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back home
        </Link>
      </div>
    </section>
  );
}

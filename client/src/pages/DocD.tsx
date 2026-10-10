import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, Send } from 'lucide-react';
import FloatingBackdrop from '../components/FloatingBackdrop';

export default function DocD() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-navy-950 pt-16 text-cream">
      <FloatingBackdrop preset="about" theme="dark" />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-1.5 font-heading text-sm font-semibold text-navy-950">
          <Bot size={16} aria-hidden="true" />
          Coming soon
        </span>

        <h1 className="type-head mt-6 max-w-3xl font-heading font-bold tracking-tight">
          Doc D will soon come conquering your browser
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/75">
          Soon you will be able to talk to Doc D yourself and ask him anything about building,
          hosting and shipping. Until then, catch up on how he helped Engineer X.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/#top"
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-heading text-sm font-semibold text-navy-950 transition hover:bg-gold-200"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to the story
          </Link>
        </div>

        <div
          className="mt-14 flex max-w-xl items-center gap-3 rounded-full border border-cream/15 bg-navy-900 p-2 pl-6"
          aria-hidden="true"
        >
          <span className="flex-1 text-cream/50">Ask Doc D anything…</span>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-700 text-cream/60">
            <Send size={18} />
          </span>
        </div>
      </div>
    </section>
  );
}

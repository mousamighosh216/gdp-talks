import type { Metadata } from 'next';
import FloatingBackdrop from '@/components/FloatingBackdrop';
import RegisterForm from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Register your team',
  description: 'Register a team of 2 to 3 students for the GDP Talks hackathon.',
};

export default function RegisterPage() {
  return (
    <section className="relative overflow-hidden bg-cream pb-24 pt-28">
      <FloatingBackdrop preset="journey" />
      <div className="relative mx-auto max-w-3xl px-5">
        <h1 className="type-head mt-2 font-heading font-bold tracking-tight text-navy-950">
          Register your hackathon team
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy-950/85">
          Fill in verified participant details. A team has a minimum of 2 and a maximum of 3
          members. One person registers for the whole team.
        </p>
        <div className="mt-10">
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}

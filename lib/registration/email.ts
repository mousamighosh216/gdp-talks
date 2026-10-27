import nodemailer from 'nodemailer';
import type { RegistrationInput } from './registration';

type ValidRegistration = Required<Omit<RegistrationInput, 'website'>>;

export async function sendRegistrationConfirmation(
  reference: string,
  registration: ValidRegistration
): Promise<void> {
  const host = process.env.MAIL_HOST;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!host || !user || !pass) {
    throw new Error('Registration confirmation email is not configured');
  }

  const port = Number(process.env.MAIL_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  const roster = registration.members
    .map(
      (member, index) =>
        `${index === 0 ? 'Team lead' : `Member ${index + 1}`}:\n` +
        `Name: ${member.name}\nEmail: ${member.email}\nPhone: +91${member.phone}`
    )
    .join('\n\n');
  const text = [
    'Your GDP Talks registration is confirmed.',
    '',
    `Reference ID: ${reference}`,
    `Team name: ${registration.teamName}`,
    `Institution: ${registration.institution}`,
    `Team size: ${registration.members.length}`,
    '',
    'Registered members:',
    roster,
  ].join('\n');

  const results = await Promise.allSettled(
    registration.members.map((member) =>
      transporter.sendMail({
        from: process.env.MAIL_FROM || user,
        to: member.email,
        subject: `GDP Talks registration confirmed - ${reference}`,
        text,
      })
    )
  );
  const failed = results.filter((result) => result.status === 'rejected').length;
  if (failed > 0) {
    throw new Error(`Confirmation email delivery failed for ${failed} of ${results.length} team members`);
  }
}

import nodemailer from 'nodemailer';
import type { EventRegistration } from './eventregistration';

type ValidRegistration = Required<EventRegistration>;

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
  
  const text = [
    'Your registration is confirmed.',
    'Join the community: https://chat.whatsapp.com/HeV0Em5kbBKGEjTRWzdo1Z',
    '',
    `Reference ID: ${reference}`,
    `Name: ${registration.name}`,
    `Email: ${registration.email}`,
    `Phone: ${registration.phone}`,
    ' ',
    `Event Description: ${registration.eventDescription}`,
    `Event Takeway: ${registration.eventTakeway}`,
    `Document Links: ${registration.documentLinks}`,
    ' ',
    'Refer to this document for more information about the event: https://drive.google.com/file/d/1SE7xklC-4G1NlBXWng0NRDQPJTpvmfNC/view?usp=sharing'
  ].join('\n');

  const results = await Promise.allSettled([
    transporter.sendMail({
      from: process.env.MAIL_FROM || user,
      to: registration.email,
      subject: `GDP Talks registration confirmed - ${reference}`,
      text,
    }),
  ]);
  const failed = results.filter((result) => result.status === 'rejected').length;
  if (failed > 0) {
    throw new Error(`Confirmation email delivery failed for ${failed} recipient(s)`);
  }
}

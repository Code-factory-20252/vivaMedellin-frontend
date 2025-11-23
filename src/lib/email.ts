import nodemailer from 'nodemailer';

export async function sendWelcomeEmail({ to, username }: { to: string; username?: string }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"VivaMedellin" <noreply@vivamedellin.com>',
    to,
    subject: 'Bienvenido a VivaMedellin',
    html: `
      <h1>¡Bienvenido a VivaMedellin!</h1>
      <p>Hola ${username || to},</p>
      <p>Gracias por registrarte en VivaMedellin. Estamos emocionados de tenerte con nosotros.</p>
      <ul>
        <li>Explorar eventos en Medellín</li>
        <li>Agregar eventos a tus favoritos</li>
        <li>Seguir a otros usuarios</li>
        <li>Crear tu perfil personalizado</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Ir al Dashboard</a>
    `,
  });
}

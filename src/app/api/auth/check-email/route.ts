import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      return NextResponse.json({
        exists: false,
        valid: false,
        message: 'Formato de email inválido',
      });
    }

    const tempEmailDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'throwaway.email',
      'yopmail.com',
      'getnada.com',
      'tempmail.net',
      'trashmail.com',
    ];

    const emailDomain = email.split('@')[1]?.toLowerCase();
    const isTempEmail = tempEmailDomains.some((domain) => emailDomain?.includes(domain));

    if (isTempEmail) {
      return NextResponse.json({
        exists: false,
        valid: false,
        message: 'No se permiten correos electrónicos temporales',
      });
    }

    return NextResponse.json({
      exists: false,
      valid: true,
      message: 'Email disponible',
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ error: 'Error checking email' }, { status: 500 });
  }
}

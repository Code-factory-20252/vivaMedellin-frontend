import { NextResponse } from 'next/server';
import { checkUsernameExists } from '@/lib/auth-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const exists = await checkUsernameExists(username);
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json({ error: 'Error checking username' }, { status: 500 });
  }
}

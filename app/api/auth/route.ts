import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authorization.split(' ')[1];

  try {
    // Simple JWT payload extraction (for demo purposes)
    // In production, you should implement proper JWT verification
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    return NextResponse.json({
      fid: payload.sub,
      authenticated: true,
      timestamp: payload.iat,
      expires: payload.exp,
    });
  } catch (e) {
    console.error('Auth verification error:', e);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
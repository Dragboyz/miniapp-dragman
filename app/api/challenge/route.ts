import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new challenge
    const challenge = {
      id: Date.now().toString(),
      from: body.from,
      to: body.to,
      type: body.type,
      target: body.target,
      timeLimit: body.timeLimit || 30000,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (body.timeLimit || 30000)
    };
    
    // Save challenge to database
    // await saveChallenge(challenge);
    
    // Send notification to challenged user
    // await sendChallengeNotification(challenge);
    
    console.log('Challenge created:', challenge);
    
    return NextResponse.json({ success: true, challengeId: challenge.id });
  } catch (error) {
    console.error('Challenge creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challengeId = searchParams.get('id');
  const fid = searchParams.get('fid');
  
  if (challengeId) {
    // Get specific challenge
    // const challenge = await getChallenge(challengeId);
    const challenge = {
      id: challengeId,
      from: { fid: 12345, username: 'DragonMaster' },
      to: { fid: parseInt(fid || '0'), username: 'You' },
      type: 'score',
      target: 1000,
      status: 'pending',
      createdAt: Date.now() - 10000,
      expiresAt: Date.now() + 20000
    };
    
    return NextResponse.json({ challenge });
  }
  
  if (fid) {
    // Get challenges for user
    // const challenges = await getUserChallenges(parseInt(fid));
    const challenges = [
      {
        id: '1',
        from: { fid: 12345, username: 'DragonMaster' },
        to: { fid: parseInt(fid), username: 'You' },
        type: 'score',
        target: 1000,
        status: 'pending',
        createdAt: Date.now() - 10000,
        expiresAt: Date.now() + 20000
      }
    ];
    
    return NextResponse.json({ challenges });
  }
  
  return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
}

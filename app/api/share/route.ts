import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get('score');
  const gameMode = searchParams.get('mode') || 'classic';
  const fid = searchParams.get('fid');
  
  // Create share page
  const shareHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dragman - Score Shared!</title>
        <meta property="og:title" content="Dragman - Score Shared!" />
        <meta property="og:description" content="I just scored ${score} points in ${gameMode} mode! Can you beat my score?" />
        <meta property="og:image" content="https://dragman.xyz/og-image.svg" />
        <meta property="og:url" content="https://dragman.xyz" />
        <meta property="og:type" content="website" />
        <meta name="fc:miniapp" content='{
          "version":"next",
          "imageUrl":"https://dragman.xyz/preview.svg",
          "button":{
            "title":"Play Dragman",
            "action":{
              "type":"launch_miniapp",
              "name":"Dragman Mini App",
              "url":"https://dragman.xyz"
            }
          }
        }' />
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 50px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(0,0,0,0.3);
            padding: 40px;
            border-radius: 20px;
          }
          .dragon {
            font-size: 100px;
            margin: 20px 0;
          }
          .score {
            font-size: 48px;
            font-weight: bold;
            color: #ff6b35;
            margin: 20px 0;
          }
          .play-button {
            background: #ff6b35;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            margin: 20px 0;
            text-decoration: none;
            display: inline-block;
          }
          .play-button:hover {
            background: #f7931e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="dragon">??</div>
          <h1>Amazing Score!</h1>
          <div class="score">${score?.toLocaleString()} Points</div>
          <p>I just scored ${score} points in ${gameMode} mode on Dragman!</p>
          <p>Can you beat my score?</p>
          <a href="https://dragman.xyz" class="play-button">Play Dragman</a>
          <p style="margin-top: 30px; opacity: 0.8;">
            Challenge friends and compete on leaderboards!
          </p>
        </div>
      </body>
    </html>
  `;
  
  return new NextResponse(shareHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle share data
    const shareData = {
      text: body.text,
      embeds: body.embeds || [],
      timestamp: Date.now(),
      fid: body.fid
    };
    
    // Process share (save to database, analytics, etc.)
    console.log('Share processed:', shareData);
    
    return NextResponse.json({ success: true, shareId: Date.now().toString() });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
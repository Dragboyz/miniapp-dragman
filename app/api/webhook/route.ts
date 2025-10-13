import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
// In production, use a proper database
const userNotifications = new Map<number, { url: string; token: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Parse webhook event
    const { fid, event } = body;
    
    if (!fid || !event) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    console.log('Webhook received:', { fid, event: event.event });

    // Handle different event types
    switch (event.event) {
      case 'miniapp_added':
        if (event.notificationDetails) {
          userNotifications.set(fid, event.notificationDetails);
          console.log(`User ${fid} added mini app with notifications`);
          
          // Send welcome notification
          await sendNotification(fid, {
            title: 'Welcome to Dragman! 🐉',
            body: 'Your dragon adventure begins now!',
          });
        }
        break;

      case 'miniapp_removed':
        userNotifications.delete(fid);
        console.log(`User ${fid} removed mini app`);
        break;

      case 'notifications_enabled':
        if (event.notificationDetails) {
          userNotifications.set(fid, event.notificationDetails);
          console.log(`User ${fid} enabled notifications`);
          
          await sendNotification(fid, {
            title: 'Notifications Enabled! 🔔',
            body: 'You\'ll now receive updates about your dragon adventures!',
          });
        }
        break;

      case 'notifications_disabled':
        userNotifications.delete(fid);
        console.log(`User ${fid} disabled notifications`);
        break;

      default:
        console.log('Unknown event type:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendNotification(fid: number, notification: { title: string; body: string }) {
  const userNotification = userNotifications.get(fid);
  
  if (!userNotification) {
    console.log(`No notification details for user ${fid}`);
    return;
  }

  try {
    const response = await fetch(userNotification.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title: notification.title,
        body: notification.body,
        targetUrl: 'https://dragman.xyz',
        tokens: [userNotification.token],
      }),
    });

    if (response.ok) {
      console.log(`Notification sent to user ${fid}`);
    } else {
      console.error(`Failed to send notification to user ${fid}:`, await response.text());
    }
  } catch (error) {
    console.error(`Error sending notification to user ${fid}:`, error);
  }
}

// Helper function to send notifications from other parts of the app
async function sendDragmanNotification(fid: number, title: string, body: string) {
  await sendNotification(fid, { title, body });
}

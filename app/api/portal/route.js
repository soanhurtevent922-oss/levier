import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripeClient';

export async function POST(req) {
  try {
    const { stripeCustomerId } = await req.json();
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'stripeCustomerId manquant' }, { status: 400 });
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${siteUrl}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

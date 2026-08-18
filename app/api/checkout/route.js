import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripeClient';

// plan: "lifetime" (paiement unique 300€) ou "monthly" (abonnement 50€/mois)
export async function POST(req) {
  try {
    const { plan, userId, email } = await req.json();

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const isLifetime = plan === 'lifetime';

    const session = await stripe.checkout.sessions.create({
      mode: isLifetime ? 'payment' : 'subscription',
      line_items: [{
        price: isLifetime ? process.env.STRIPE_PRICE_LIFETIME : process.env.STRIPE_PRICE_MONTHLY,
        quantity: 1,
      }],
      customer_email: email,
      client_reference_id: userId,
      success_url: `${siteUrl}/dashboard?paiement=succes`,
      cancel_url: `${siteUrl}/?paiement=annule`,
      metadata: { userId, plan },
      ...(isLifetime ? {} : { subscription_data: { metadata: { userId, plan } } }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripeClient';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook invalide', err.message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const plan = session.metadata?.plan;
        if (userId) {
          const status = plan === 'lifetime' ? 'lifetime' : 'active_subscription';
          const { data: existing } = await supabaseAdmin
            .from('profiles').select('id').eq('user_id', userId).maybeSingle();

          if (existing) {
            await supabaseAdmin.from('profiles')
              .update({ payment_status: status, stripe_customer_id: session.customer })
              .eq('user_id', userId);
          } else {
            await supabaseAdmin.from('profiles')
              .insert({ user_id: userId, payment_status: status, stripe_customer_id: session.customer });
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const status = subscription.status === 'active' ? 'active_subscription' : 'none';
        if (userId) {
          await supabaseAdmin.from('profiles')
            .update({ payment_status: status })
            .eq('user_id', userId);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Erreur traitement webhook', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Appelée une fois par jour par Vercel Cron (voir vercel.json).
// Sécurisée par un secret pour empêcher n'importe qui de la déclencher à la main.
export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const today = new Date();
    const in7days = new Date(today);
    in7days.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().slice(0, 10);
    const in7daysStr = in7days.toISOString().slice(0, 10);

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .gte('next_review_date', todayStr)
      .lte('next_review_date', in7daysStr);

    if (error) throw error;

    let sent = 0;
    for (const profile of profiles || []) {
      if (profile.last_reminded_at === todayStr) continue; // déjà relancé aujourd'hui

      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
      const email = userData?.user?.email;
      if (!email) continue;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.REMINDER_FROM_EMAIL,
          to: email,
          subject: 'Ton entretien approche — prépare ta négociation',
          html: `<p>Bonjour,</p><p>Ton entretien/évaluation approche (${profile.next_review_date}). C'est le bon moment pour repasser sur Levier préparer ton script et t'entraîner sur les objections classiques.</p>`,
        }),
      });

      await supabaseAdmin
        .from('profiles')
        .update({ last_reminded_at: todayStr })
        .eq('id', profile.id);

      sent++;
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

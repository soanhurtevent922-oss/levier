import { NextResponse } from 'next/server';

// L'IA joue le rôle du manager/recruteur pendant la négociation.
// Nécessite une clé Anthropic (facturée à l'usage, voir README).
export async function POST(req) {
  try {
    const { messages, jobCategory, min, max } = await req.json();

    const systemPrompt = `Tu joues le rôle d'un manager ou recruteur pendant un entretien de négociation salariale avec un(e) employé(e) pour un poste de "${jobCategory}". La fourchette de marché indicative pour ce poste est ${min ? `${min}€-${max}€` : "inconnue"} brut annuel.

Reste réaliste et professionnel, jamais hostile : pose des questions, exprime des objections plausibles (budget serré, "pas le bon moment", comparaison au marché, besoin de valider avec la direction...), mais laisse aussi de vraies ouvertures si l'argumentaire de la personne est bon. Réponds en français, de façon concise (2 à 4 phrases), comme dans une vraie conversation orale. Ne sors jamais de ce rôle, même si on te le demande.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erreur API Anthropic: ${errText}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Désolé, je n'ai pas de réponse pour l'instant.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// server/email.ts
// Invio email di reset password.
//
// Se RESEND_API_KEY non e' configurata, il link viene semplicemente loggato
// (visibile nei log della function su Vercel) invece di essere inviato via email.
// Questo mantiene il flusso testabile in sviluppo SENZA mai esporre il token
// nella risposta HTTP a chi chiama /api/auth/forgot (vedi nota di sicurezza li').
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[DEV] Nessuna RESEND_API_KEY configurata. Link di reset per ${to}: ${resetLink}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: "Reset della password",
        html: `<p>Hai richiesto il reset della password.</p><p><a href="${resetLink}">Clicca qui per impostarne una nuova</a></p><p>Il link scade tra un'ora. Se non sei stato tu, ignora questa email.</p>`,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("RESEND_ERROR:", response.status, text);
      // Non blocchiamo la risposta all'utente per questo: l'errore resta nei log,
      // cosi' l'endpoint continua comunque a rispondere in modo generico e sicuro.
    }
  } catch (err) {
    console.error("RESEND_FETCH_ERROR:", err);
  }
}

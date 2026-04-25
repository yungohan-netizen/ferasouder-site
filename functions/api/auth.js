/**
 * Cloudflare Pages Function — GitHub OAuth proxy pour Decap CMS
 * Fichier : functions/api/auth.js
 *
 * Variables d'environnement à configurer dans Cloudflare Pages :
 *   GITHUB_CLIENT_ID      → depuis ton GitHub OAuth App
 *   GITHUB_CLIENT_SECRET  → depuis ton GitHub OAuth App
 */

const GITHUB_OAUTH_URL = "https://github.com/login/oauth";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // ── Étape 2 : GitHub nous renvoie un ?code= → échange contre un token ──────
  if (code) {
    const tokenRes = await fetch(`${GITHUB_OAUTH_URL}/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept":       "application/json",
      },
      body: JSON.stringify({
        client_id:     env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return new Response(
        `Erreur GitHub OAuth : ${tokenData.error_description || tokenData.error || "inconnue"}`,
        { status: 401 }
      );
    }

    // Renvoie le token à Decap CMS via postMessage (format exact attendu par le CMS)
    const token   = tokenData.access_token;
    const content = JSON.stringify({ token, provider: "github" });
    const html = `<!doctype html><html><body><script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:success:${content}',
            e.origin
          );
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    <\/script></body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  }

  // ── Étape 1 : pas de code → on redirige vers GitHub pour l'autorisation ─────
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/api/auth`,
    scope: "repo",
  });

  return Response.redirect(`${GITHUB_OAUTH_URL}/authorize?${params}`, 302);
}
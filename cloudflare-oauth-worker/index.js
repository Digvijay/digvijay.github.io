export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Auth Endpoint: Redirect user to GitHub OAuth login
    if (url.pathname === '/auth') {
      const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
      githubAuthUrl.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
      githubAuthUrl.searchParams.set('scope', 'repo,user');
      return Response.redirect(githubAuthUrl.toString(), 302);
    }

    // 2. Callback Endpoint: Exchange code for access_token and return to Decap CMS
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }

      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Decap-CMS-Cloudflare-OAuth-Proxy'
          },
          body: JSON.stringify({
            client_id: env.OAUTH_CLIENT_ID,
            client_secret: env.OAUTH_CLIENT_SECRET,
            code
          })
        });

        const data = await response.json();

        if (data.error) {
          return new Response(`OAuth Error: ${data.error_description || data.error}`, { status: 400 });
        }

        const token = data.access_token;
        const provider = 'github';

        // Decap CMS postMessage communication template
        const html = `
          <!DOCTYPE html>
          <html>
          <head><title>Authorizing...</title></head>
          <body>
          <script>
            (function() {
              function receiveMessage(e) {
                console.log("receiveMessage %o", e);
                window.opener.postMessage(
                  'authorization:${provider}:success:${JSON.stringify({ token, provider })}',
                  e.origin
                );
              }
              window.addEventListener("message", receiveMessage, false);
              window.opener.postMessage("authorizing:${provider}", "*");
            })();
          </script>
          </body>
          </html>
        `;

        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      } catch (err) {
        return new Response(`Server error: ${err.message}`, { status: 500 });
      }
    }

    return new Response('Cloudflare Decap CMS OAuth Proxy is running.', { status: 200 });
  }
};

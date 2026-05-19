const docsHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Soccer Planner API</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f8fafc;
        --text: #0f172a;
        --muted: #475569;
        --line: #cbd5e1;
        --panel: #ffffff;
        --accent: #047857;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.6;
      }

      main {
        margin: 0 auto;
        max-width: 920px;
        padding: 48px 20px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: clamp(2rem, 5vw, 3rem);
        line-height: 1.1;
      }

      h2 {
        margin: 0;
        font-size: 1.1rem;
      }

      p {
        color: var(--muted);
        margin: 0;
      }

      section {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        margin-top: 20px;
        padding: 20px;
      }

      code,
      pre {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      }

      code {
        background: #ecfdf5;
        border-radius: 6px;
        color: #065f46;
        padding: 2px 6px;
      }

      pre {
        background: #0f172a;
        border-radius: 8px;
        color: #e2e8f0;
        overflow-x: auto;
        padding: 14px;
      }

      .method {
        color: var(--accent);
        font-weight: 700;
      }

      .meta {
        margin-top: 6px;
      }

      ul {
        margin: 12px 0 0;
        padding-left: 20px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Soccer Planner API</h1>
      <p>Minimal REST API for mobile clients. Protected endpoints require <code>Authorization: Bearer &lt;token&gt;</code>.</p>

      <section>
        <h2><span class="method">POST</span> /api/auth/login</h2>
        <p class="meta">Login with email and password. Returns a JWT bearer token.</p>
        <pre>{
  "email": "steve@gmail.com",
  "password": "pass123"
}</pre>
      </section>

      <section>
        <h2><span class="method">GET</span> /api/matches?page=1&amp;pageSize=20</h2>
        <p class="meta">Lists active matches from the authenticated user's groups. Results are paged.</p>
      </section>

      <section>
        <h2><span class="method">GET</span> /api/matches/[id]</h2>
        <p class="meta">Returns match details, joined state, players, occupied slots, and comments.</p>
      </section>

      <section>
        <h2><span class="method">POST</span> /api/matches/[id]/join</h2>
        <p class="meta">Joins an active match. Safe to call if already joined.</p>
      </section>

      <section>
        <h2><span class="method">POST</span> /api/matches/[id]/leave</h2>
        <p class="meta">Leaves an active match. Safe to call if not currently joined.</p>
      </section>

      <section>
        <h2><span class="method">POST</span> /api/matches/[id]/slots</h2>
        <p class="meta">Updates additional reserved slots for the authenticated user after joining.</p>
        <pre>{
  "extraSlots": 1
}</pre>
      </section>

      <section>
        <h2>Common Responses</h2>
        <ul>
          <li><code>401</code> missing or invalid bearer token</li>
          <li><code>403</code> match belongs to a group the user cannot access</li>
          <li><code>404</code> match not found</li>
          <li><code>409</code> match is closed or the action conflicts with current state</li>
        </ul>
      </section>
    </main>
  </body>
</html>`;

export async function GET() {
  return new Response(docsHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

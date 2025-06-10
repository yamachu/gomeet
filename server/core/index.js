import { Hono } from "hono";

export const app = new Hono();

app.get("/oauth2/callback", (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code) {
    return c.text("認可コードがありません", 400);
  }
  return c.html(`
    <h1>Google認証が完了しました</h1>
    <p>下記の認可コードをSlackのGo Meetアプリに貼り付けてください。</p>
    <pre>${code}</pre>
    <p>（state: ${state}）</p>
  `);
});

import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Google認証トークンをユーザーごとに保存するDatastore
 * user_id: SlackユーザーID
 * refresh_token: GoogleのRefreshToken
 * access_token: GoogleのAccessToken（必要に応じて）
 * token_expiry: 有効期限（必要に応じて）
 */
export default DefineDatastore({
  name: "google_tokens",
  primary_key: "user_id",
  attributes: {
    user_id: {
      type: Schema.types.string,
    },
    refresh_token: {
      type: Schema.types.string,
    },
    // 必要に応じて追加
    // access_token: { type: Schema.types.string },
    // token_expiry: { type: Schema.types.integer },
  },
});

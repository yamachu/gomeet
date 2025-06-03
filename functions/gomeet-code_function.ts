import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import GoogleTokensDatastore from "../datastores/google_tokens_datastore.ts";
import { toHashedState } from "../utils/state.ts";

// Function定義
export const GomeetCodeFunctionDefinition = DefineFunction({
  callback_id: "gomeet-code_function",
  title: "Go Meet Code Function",
  description: "/gomeetコマンドの処理（サブコマンド含む）",
  source_file: "functions/gomeet-code_function.ts",
  input_parameters: {
    properties: {
      user_id: { type: Schema.slack.types.user_id },
      channel_id: { type: Schema.slack.types.channel_id },
      code: { type: Schema.types.string },
      state: { type: Schema.types.string },
    },
    required: ["user_id", "channel_id", "code", "state"],
  },
  output_parameters: {
    properties: {
      text: { type: Schema.types.string },
    },
    required: ["text"],
  },
});

// Function実装
export default SlackFunction(
  GomeetCodeFunctionDefinition,
  async ({ inputs, client, env }) => {
    const expectedState = await toHashedState(inputs.user_id, env.SALT);
    if (expectedState !== inputs.state) {
      return {
        outputs: {
          text: "不正なリクエストです。再度認証を行ってください。",
        },
      };
    }

    // 認可コード登録処理
    const code = inputs.code;
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const redirectUri = env.GOOGLE_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      return {
        outputs: {
          text:
            "Google APIクライアント情報が未設定です。管理者に連絡してください。",
        },
      };
    }
    // Google OAuth2トークンエンドポイントにPOST
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
    let tokenResponse;
    try {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      tokenResponse = await res.json();
      if (tokenResponse.error) {
        return {
          outputs: {
            text:
              `トークン取得に失敗しました: ${tokenResponse.error} - ${tokenResponse.error_description}`,
          },
        };
      }
    } catch (e) {
      console.error("トークン取得エラー:", e);
      return {
        outputs: {
          text: `Googleトークン取得時にエラーが発生しました: ${e}`,
        },
      };
    }
    if (!tokenResponse.refresh_token) {
      return {
        outputs: {
          text:
            `トークン取得に失敗しました。認可コードが正しいか、再度認証を行ってください。`,
        },
      };
    }
    // Datastoreへ保存
    try {
      await client.apps.datastore.put({
        datastore: GoogleTokensDatastore.name,
        item: {
          user_id: inputs.user_id,
          refresh_token: tokenResponse.refresh_token,
        },
      });
    } catch (e) {
      return {
        outputs: {
          text: `トークン保存時にエラーが発生しました: ${e}`,
        },
      };
    }
    return {
      outputs: {
        text: "Google認証が完了しました。これでMeet作成が可能です。",
      },
    };
  },
);

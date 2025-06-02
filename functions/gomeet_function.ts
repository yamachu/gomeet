import GoogleTokensDatastore from "../datastores/google_tokens_datastore.ts";
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// Google認証用URL生成関数（ダミー）
function getGoogleAuthUrl(user_id: string): string {
  // TODO: Google OAuthクライアント情報を用いて認証URLを生成する
  // credential.json等は後で用意
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=TODO_CLIENT_ID&redirect_uri=TODO_REDIRECT_URI&response_type=code&scope=calendar&state=${user_id}`;
}

// Function定義
export const GomeetFunctionDefinition = DefineFunction({
  callback_id: "gomeet_function",
  title: "Go Meet Function",
  description: "/gomeetコマンドの処理（サブコマンド含む）",
  source_file: "functions/gomeet_function.ts",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      channel_id: { type: Schema.types.string },
      text: { type: Schema.types.string }, // コマンド引数全体
    },
    required: ["user_id", "channel_id", "text"],
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
  GomeetFunctionDefinition,
  async ({ inputs, client }) => {
    const text = (inputs.text || "").trim();
    // サブコマンド判定
    if (text.startsWith("code ")) {
      // 認可コード登録処理
      const code = text.replace(/^code\s+/, "");
      // TODO: Google APIクライアント情報（credential.json等）は後で用意
      // 認可コードからトークン取得処理
      // const tokenResponse = await fetch(...)
      // const refresh_token = tokenResponse.refresh_token;

      // TODO: Datastoreへ保存する処理
      // await client.apps.datastore.put({
      //   datastore: GoogleTokensDatastore.name,
      //   item: { user_id: inputs.user_id, refresh_token },
      // });

      return {
        outputs: {
          text:
            "認可コードを受け取りました。トークン取得・保存処理は今後実装します。",
        },
      };
    } else {
      // 通常のMeet作成フロー
      const result = await client.apps.datastore.get({
        datastore: GoogleTokensDatastore.name,
        id: inputs.user_id,
      });
      const refresh_token = result?.item?.["refresh_token"] as
        | string
        | undefined;
      if (result.ok && refresh_token) {
        // TODO: Google Calendar APIでMeet作成処理をここに追加
        return {
          outputs: {
            text: "（仮）Google認証済みです。今後ここでMeetを作成します。",
          },
        };
      } else {
        // 未認証なら認証URLを案内
        const authUrl = getGoogleAuthUrl(inputs.user_id);
        return {
          outputs: {
            text:
              `Google Meetを作成するにはGoogle認証が必要です。以下のURLから認証を行ってください。\n${authUrl}`,
          },
        };
      }
    }
  },
);

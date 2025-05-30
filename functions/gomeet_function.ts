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
  description: "/gomeetコマンドの処理",
  source_file: "functions/gomeet_function.ts",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      channel_id: { type: Schema.types.string },
      command: { type: Schema.types.string },
    },
    required: ["user_id", "channel_id", "command"],
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
  ({ inputs }) => {
    // TODO: Datastoreからinputs.user_idのトークン有無を判定する処理を追加
    // 今は常に認証案内を返す
    const authUrl = getGoogleAuthUrl(inputs.user_id);
    return {
      outputs: {
        text:
          `Google Meetを作成するにはGoogle認証が必要です。以下のURLから認証を行ってください。\n${authUrl}`,
      },
    };
  },
);

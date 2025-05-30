import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

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
    // ここでDatastoreからトークン有無を判定する処理などを今後追加
    return {
      outputs: {
        text:
          "Google Meetを作成するにはGoogle認証が必要です。後ほど認証フローを案内します。",
      },
    };
  },
);

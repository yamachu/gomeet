import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import GoogleTokensDatastore from "../datastores/google_tokens_datastore.ts";

// Function定義
export const GomeetCodeFunctionDefinition = DefineFunction({
  callback_id: "gomeet_code_function",
  title: "Go Meet Code Function",
  description: "/gomeet code <認可コード> でGoogle認可コードを受け取る",
  source_file: "functions/gomeet_code_function.ts",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      code: { type: Schema.types.string },
    },
    required: ["user_id", "code"],
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
  async ({ inputs, client }) => {
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
  },
);

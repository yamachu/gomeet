import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GomeetFunctionDefinition } from "../functions/gomeet_function.ts";

// ワークフロー本体
const GomeetWorkflow = DefineWorkflow({
  callback_id: "gomeet_workflow",
  title: "Go Meet Workflow",
  description:
    "Google Meetを作成・認可コード登録も対応するワークフロー（ショートカット起動対応）",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      channel_id: { type: Schema.types.string },
      text: {
        type: Schema.types.string,
        description:
          "コマンド引数や認可コードを入力してください（例: code <認可コード>）",
        title: "コマンド引数/認可コード",
      },
    },
    required: ["user_id", "channel_id", "text"],
  },
});

GomeetWorkflow.addStep(GomeetFunctionDefinition, GomeetWorkflow.inputs);

export default GomeetWorkflow;

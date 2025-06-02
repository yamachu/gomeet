import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GomeetFunctionDefinition } from "../functions/gomeet_function.ts";

// ワークフロー本体
const GomeetWorkflow = DefineWorkflow({
  callback_id: "gomeet_workflow",
  title: "Go Meet Workflow",
  description:
    "/gomeetコマンドでGoogle Meetを作成・認可コード登録も対応するワークフロー",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      channel_id: { type: Schema.types.string },
      text: { type: Schema.types.string },
    },
    required: ["user_id", "channel_id", "text"],
  },
});

GomeetWorkflow.addStep(GomeetFunctionDefinition, GomeetWorkflow.inputs);

export default GomeetWorkflow;

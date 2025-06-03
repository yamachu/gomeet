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
      user_id: { type: Schema.slack.types.user_id },
      channel_id: { type: Schema.slack.types.channel_id },
    },
    required: ["user_id", "channel_id"],
  },
});

const functionStep = GomeetWorkflow.addStep(
  GomeetFunctionDefinition,
  GomeetWorkflow.inputs,
);

GomeetWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: GomeetWorkflow.inputs.channel_id,
  message: functionStep.outputs.text,
});

export default GomeetWorkflow;

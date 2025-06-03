import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GomeetCodeFunctionDefinition } from "../functions/gomeet-code_function.ts";

// ワークフロー本体
const GomeetCodeWorkflow = DefineWorkflow({
  callback_id: "gomeet-code_workflow",
  title: "Go Meet Code Workflow",
  description:
    "Google Meetの認可コード登録するワークフロー（ショートカット起動対応）",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      user_id: { type: Schema.slack.types.user_id },
      channel_id: { type: Schema.slack.types.channel_id },
    },
    required: ["interactivity", "user_id", "channel_id"],
  },
});

const inputForm = GomeetCodeWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "認可コードを入力してください",
    interactivity: GomeetCodeWorkflow.inputs.interactivity,
    submit_label: "送信",
    fields: {
      elements: [{
        name: "text",
        title: "コマンド引数/認可コード",
        type: Schema.types.string,
      }],
      required: ["text"],
    },
  },
);
const functionStep = GomeetCodeWorkflow.addStep(GomeetCodeFunctionDefinition, {
  channel_id: GomeetCodeWorkflow.inputs.channel_id,
  user_id: GomeetCodeWorkflow.inputs.user_id,
  text: inputForm.outputs.fields.text,
});

GomeetCodeWorkflow.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: GomeetCodeWorkflow.inputs.channel_id,
  user_id: GomeetCodeWorkflow.inputs.user_id,
  message: functionStep.outputs.text,
});

export default GomeetCodeWorkflow;

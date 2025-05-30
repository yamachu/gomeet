import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GomeetFunctionDefinition } from "../functions/gomeet_function.ts";

// ワークフロー本体
const GomeetWorkflow = DefineWorkflow({
  callback_id: "gomeet_workflow",
  title: "Go Meet Workflow",
  description: "/gomeetコマンドでGoogle Meetを作成するワークフロー",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      channel_id: { type: Schema.types.string },
      command: { type: Schema.types.string },
    },
    required: ["user_id", "channel_id", "command"],
  },
});

GomeetWorkflow.addStep(GomeetFunctionDefinition, GomeetWorkflow.inputs);

export default GomeetWorkflow;

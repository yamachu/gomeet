import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GomeetCodeFunctionDefinition } from "../functions/gomeet_code_function.ts";

// /gomeet code <認可コード> 用ワークフロー
const GomeetCodeWorkflow = DefineWorkflow({
  callback_id: "gomeet_code_workflow",
  title: "Go Meet Code Workflow",
  description:
    "/gomeet code <認可コード> でGoogle認可コードを受け取るワークフロー",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      code: { type: Schema.types.string },
    },
    required: ["user_id", "code"],
  },
});

GomeetCodeWorkflow.addStep(
  GomeetCodeFunctionDefinition,
  GomeetCodeWorkflow.inputs,
);

export default GomeetCodeWorkflow;

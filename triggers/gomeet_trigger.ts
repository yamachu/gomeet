import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-api/types.ts";
import GomeetWorkflow from "../workflows/gomeet_workflow.ts";

/**
 * Go Meet ショートカットトリガー
 * ワークフローをショートカットから起動し、ユーザーID・チャンネルID・テキスト入力を受け取る
 */
const gomeetTrigger: Trigger<typeof GomeetWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Go Meet",
  description: "Google Meetを作成",
  workflow: `#/workflows/${GomeetWorkflow.definition.callback_id}`,
  inputs: {
    user_id: {
      value: TriggerContextData.Shortcut.user_id,
    },
    channel_id: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default gomeetTrigger;

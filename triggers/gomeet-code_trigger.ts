import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import type { Trigger } from "deno-slack-api/types.ts";
import GomeetCodeWorkflow from "../workflows/gomeet-code_workflow.ts";

/**
 * Go Meet ショートカットトリガー
 * ワークフローをショートカットから起動し、ユーザーID・チャンネルID・テキスト入力を受け取る
 */
const gomeetCodeTrigger: Trigger<typeof GomeetCodeWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Go Meet Code",
  description: "Google Meetを作成・認可コード登録も対応",
  workflow: `#/workflows/${GomeetCodeWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    user_id: {
      value: TriggerContextData.Shortcut.user_id,
    },
    channel_id: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default gomeetCodeTrigger;

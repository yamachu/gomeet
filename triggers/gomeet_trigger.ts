import { Trigger } from "deno-slack-api/types.ts";
import GomeetWorkflow from "../workflows/gomeet_workflow.ts";

/**
 * Go Meet ショートカットトリガー
 * ワークフローをショートカットから起動し、ユーザーID・チャンネルID・テキスト入力を受け取る
 */
const gomeetTrigger: Trigger<typeof GomeetWorkflow.definition> = {
  type: "shortcut",
  name: "Go Meet",
  description: "Google Meetを作成・認可コード登録も対応",
  workflow: `#/workflows/gomeet_workflow`,
  inputs: {
    user_id: {
      value: "{{data.user_id}}",
    },
    channel_id: {
      value: "{{data.channel_id}}",
    },
    text: {
      value: "{{data.text}}", // ショートカット起動時にフォーム入力で受け取る想定
    },
  },
};

export default gomeetTrigger;

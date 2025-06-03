import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type { Env } from "deno-slack-sdk/types.ts";
import GoogleTokensDatastore from "../datastores/google_tokens_datastore.ts";
import { toHashedState } from "../utils/state.ts";

async function getGoogleAuthUrl(env: Env, user_id: string): Promise<string> {
  const scope = [
    "https://www.googleapis.com/auth/calendar.events",
  ].join(" ");
  const state = await toHashedState(
    user_id,
    env.SALT,
  );

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${
    encodeURIComponent(env.GOOGLE_REDIRECT_URI)
  }&response_type=code&scope=${
    encodeURIComponent(scope)
  }&state=${state}&access_type=offline&prompt=consent`;
}

// Function定義
export const GomeetFunctionDefinition = DefineFunction({
  callback_id: "gomeet_function",
  title: "Go Meet Function",
  description: "Google Meetを作成する関数",
  source_file: "functions/gomeet_function.ts",
  input_parameters: {
    properties: {
      user_id: { type: Schema.slack.types.user_id },
      channel_id: { type: Schema.slack.types.channel_id },
    },
    required: ["user_id", "channel_id"],
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
  GomeetFunctionDefinition,
  async ({ inputs, client, env, token }) => {
    // 通常のMeet作成フロー
    const result = await client.apps.datastore.get({
      datastore: GoogleTokensDatastore.name,
      id: inputs.user_id,
    });
    const refresh_token = result?.item?.["refresh_token"] as
      | string
      | undefined;
    if (result.ok && refresh_token) {
      console.log("Google認証トークンが見つかりました。Meetを作成します。");
      // Google Calendar APIでMeet作成処理
      const clientId = env.GOOGLE_CLIENT_ID;
      const clientSecret = env.GOOGLE_CLIENT_SECRET;
      // 1. refresh_tokenからaccess_token取得
      const tokenParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token,
        grant_type: "refresh_token",
      });
      let accessToken = "";
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenParams.toString(),
        });
        const tokenJson = await tokenRes.json();
        accessToken = tokenJson.access_token;
        if (!accessToken) {
          return {
            outputs: {
              text:
                `Googleアクセストークン取得に失敗しました。再認証をお試しください。`,
            },
          };
        }
      } catch (e) {
        return {
          outputs: {
            text: `Googleアクセストークン取得時にエラー: ${e}`,
          },
        };
      }
      // 2. Google Calendar APIでイベント作成（Meet付き）
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 60 * 1000); // 30分後
      const eventBody = {
        summary: "Slackから作成したGoogle Meet", // TODO: チャンネル名を入れるなど工夫
        start: { dateTime: now.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `${inputs.user_id}-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };
      let meetUrl = "";
      try {
        const calRes = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventBody),
          },
        );
        const calJson = await calRes.json();
        meetUrl = calJson.conferenceData?.entryPoints?.find((ep: any) =>
          ep.entryPointType === "video"
        )?.uri;
        if (!meetUrl) {
          return {
            outputs: {
              text: `Meet URLの取得に失敗しました。詳細: ${
                JSON.stringify(calJson)
              }`,
            },
          };
        }
      } catch (e) {
        return {
          outputs: {
            text: `Google Calendar API実行時にエラー: ${e}`,
          },
        };
      }
      return {
        outputs: {
          text: `Google Meetを作成しました！\n<${meetUrl}|${meetUrl}>`,
        },
      };
    } else {
      // 未認証なら認証URLを案内
      const authUrl = await getGoogleAuthUrl(env, inputs.user_id);
      console.log("Google認証が必要です。認証URLを案内します。", authUrl);
      const res = await client.chat.postEphemeral({
        token,
        channel: inputs.channel_id,
        user: inputs.user_id,
        text:
          `Google Meetを作成するにはGoogle認証が必要です。以下のURLから認証を行ってください。\n${authUrl}\n codeを取得したら、gomeet codeを実行してください。`,
      });
      console.log("認証案内メッセージ送信結果:", res);
      return {
        outputs: {
          text: `送信されたメッセージを確認してください、認証が必要です。`,
        },
      };
    }
  },
);

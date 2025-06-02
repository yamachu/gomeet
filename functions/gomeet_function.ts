import type { Env } from "deno-slack-sdk/types.ts";
import GoogleTokensDatastore from "../datastores/google_tokens_datastore.ts";
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// Google認証用URL生成関数（ダミー）
function getGoogleAuthUrl(env: Env, user_id: string): string {
  // TODO: Google OAuthクライアント情報を用いて認証URLを生成する
  // credential.json等は後で用意
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${env.GOOGLE_REDIRECT_URI}&response_type=code&scope=calendar&state=${user_id}`;
}

// Function定義
export const GomeetFunctionDefinition = DefineFunction({
  callback_id: "gomeet_function",
  title: "Go Meet Function",
  description: "/gomeetコマンドの処理（サブコマンド含む）",
  source_file: "functions/gomeet_function.ts",
  input_parameters: {
    properties: {
      user_id: { type: Schema.types.string },
      channel_id: { type: Schema.types.string },
      text: { type: Schema.types.string }, // コマンド引数全体
    },
    required: ["user_id", "channel_id", "text"],
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
  async ({ inputs, client, env }) => {
    const text = (inputs.text || "").trim();
    // サブコマンド判定
    if (text.startsWith("code ")) {
      // 認可コード登録処理
      const code = text.replace(/^code\s+/, "");
      const clientId = env.GOOGLE_CLIENT_ID;
      const clientSecret = env.GOOGLE_CLIENT_SECRET;
      const redirectUri = env.GOOGLE_REDIRECT_URI;
      if (!clientId || !clientSecret || !redirectUri) {
        return {
          outputs: {
            text:
              "Google APIクライアント情報が未設定です。管理者に連絡してください。",
          },
        };
      }
      // Google OAuth2トークンエンドポイントにPOST
      const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      let tokenResponse;
      try {
        const res = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
        tokenResponse = await res.json();
      } catch (e) {
        return {
          outputs: {
            text: `Googleトークン取得時にエラーが発生しました: ${e}`,
          },
        };
      }
      if (!tokenResponse.refresh_token) {
        return {
          outputs: {
            text:
              `トークン取得に失敗しました。認可コードが正しいか、再度認証を行ってください。\n詳細: ${
                JSON.stringify(tokenResponse)
              }`,
          },
        };
      }
      // Datastoreへ保存
      try {
        await client.apps.datastore.put({
          datastore: GoogleTokensDatastore.name,
          item: {
            user_id: inputs.user_id,
            refresh_token: tokenResponse.refresh_token,
          },
        });
      } catch (e) {
        return {
          outputs: {
            text: `トークン保存時にエラーが発生しました: ${e}`,
          },
        };
      }
      return {
        outputs: {
          text: "Google認証が完了しました。これでMeet作成が可能です。",
        },
      };
    } else {
      // 通常のMeet作成フロー
      const result = await client.apps.datastore.get({
        datastore: GoogleTokensDatastore.name,
        id: inputs.user_id,
      });
      const refresh_token = result?.item?.["refresh_token"] as
        | string
        | undefined;
      if (result.ok && refresh_token) {
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
                  `Googleアクセストークン取得に失敗しました。再認証をお試しください。\n詳細: ${
                    JSON.stringify(tokenJson)
                  }`,
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
            text: `Google Meetを作成しました！\n${meetUrl}`,
          },
        };
      } else {
        // 未認証なら認証URLを案内
        const authUrl = getGoogleAuthUrl(env, inputs.user_id);
        return {
          outputs: {
            text:
              `Google Meetを作成するにはGoogle認証が必要です。以下のURLから認証を行ってください。\n${authUrl}`,
          },
        };
      }
    }
  },
);

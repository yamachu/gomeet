import { Manifest } from "deno-slack-sdk/mod.ts";
import GoogleTokensDatastore from "./datastores/google_tokens_datastore.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "go-meet",
  description: "A template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  workflows: [],
  outgoingDomains: [],
  datastores: [GoogleTokensDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});

import { Manifest } from "deno-slack-sdk/mod.ts";
import GoogleTokensDatastore from "./datastores/google_tokens_datastore.ts";
import GomeetWorkflow from "./workflows/gomeet_workflow.ts";
import GomeetCodeWorkflow from "./workflows/gomeet-code_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "go-meet",
  description: "A template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  workflows: [GomeetWorkflow, GomeetCodeWorkflow],
  outgoingDomains: [
    "oauth2.googleapis.com",
  ],
  datastores: [GoogleTokensDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});

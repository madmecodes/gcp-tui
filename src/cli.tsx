import React from "react";
import { render, Box, Text } from "ink";
import meow from "meow";
import { App } from "./app.js";
import { checkGcloudInstalled, checkAuthenticated } from "./data/config.js";

const cli = meow(
  `
  Usage
    $ gcp-tui

  Options
    --help     Show help
    --version  Show version

  Keyboard Shortcuts
    q           Quit
    Tab         Switch tabs
    1-6         Jump to tab
    r           Refresh
    j/k         Navigate rows
    s           Start/Stop VM
    d           Delete (with confirm)
    ?           Help overlay
`,
  {
    importMeta: import.meta,
  },
);

async function main() {
  // Check gcloud is installed
  const installed = await checkGcloudInstalled();
  if (!installed) {
    console.error("Error: gcloud CLI is not installed or not in PATH.");
    console.error("Install it from: https://cloud.google.com/sdk/docs/install");
    process.exit(1);
  }

  // Check authentication
  const authenticated = await checkAuthenticated();
  if (!authenticated) {
    console.error("Error: Not authenticated with gcloud.");
    console.error("Run: gcloud auth login");
    process.exit(1);
  }

  render(<App />, { patchConsole: false });
}

main();

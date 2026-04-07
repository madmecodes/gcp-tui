import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Header } from "./components/header.js";
import { TabBar } from "./components/tab-bar.js";
import { KeyHint } from "./components/key-hint.js";
import { VMsScreen } from "./screens/vms.js";
import { CostsScreen } from "./screens/costs.js";
import { KeysScreen } from "./screens/keys.js";
import { DisksScreen } from "./screens/disks.js";
import { FirewallScreen } from "./screens/firewall.js";
import { MetricsScreen } from "./screens/metrics.js";
import { getGcloudConfig } from "./data/config.js";
import { useTerminalSize } from "./hooks/use-terminal-size.js";
import { useGcloudData } from "./hooks/use-gcloud-data.js";
import { fetchVMs } from "./data/vms.js";
import { fetchDisks } from "./data/disks.js";
import type { GcloudConfig, TabName } from "./types/index.js";

const TABS: TabName[] = ["VMs", "Costs", "Keys", "Disks", "Firewall", "Metrics"];

// header (3 border lines) + tab bar (3) + content border (2 top/bottom implicit) + key hints (1) + bottom padding
const CHROME_HEIGHT = 8;

export function App() {
  const { exit } = useApp();
  const { columns, rows } = useTerminalSize();
  const [activeTab, setActiveTab] = useState<TabName>("VMs");
  const [config, setConfig] = useState<GcloudConfig | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const { data: vmData } = useGcloudData(fetchVMs, 30_000);
  const { data: diskData } = useGcloudData(fetchDisks, 30_000);

  const vmCount = vmData?.length;
  const diskCount = diskData?.length;

  const contentHeight = Math.max(5, rows - CHROME_HEIGHT);

  useEffect(() => {
    getGcloudConfig().then(setConfig);
  }, []);

  useInput((input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    if (input === "?") {
      setShowHelp((prev) => !prev);
      return;
    }

    if (showHelp) return;

    if (key.tab) {
      const idx = TABS.indexOf(activeTab);
      if (key.shift) {
        setActiveTab(TABS[(idx - 1 + TABS.length) % TABS.length]!);
      } else {
        setActiveTab(TABS[(idx + 1) % TABS.length]!);
      }
      return;
    }

    const num = parseInt(input, 10);
    if (num >= 1 && num <= TABS.length) {
      setActiveTab(TABS[num - 1]!);
    }
  });

  if (showHelp) {
    return (
      <Box flexDirection="column" height={rows} width={columns}>
        <Header config={config} vmCount={vmCount} diskCount={diskCount} />
        <Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor="cyan" flexGrow={1}>
          <Text bold color="cyan">Keyboard Shortcuts</Text>
          <Text />
          <Text><Text bold>q / Ctrl+C</Text>     Quit</Text>
          <Text><Text bold>Tab / Shift+Tab</Text> Cycle tabs</Text>
          <Text><Text bold>1-6</Text>             Jump to tab</Text>
          <Text><Text bold>r</Text>               Refresh data</Text>
          <Text><Text bold>j/k / arrows</Text>    Navigate rows</Text>
          <Text><Text bold>Enter</Text>           Detail/primary action</Text>
          <Text><Text bold>s</Text>               Start/Stop VM (VMs tab)</Text>
          <Text><Text bold>d</Text>               Delete (with confirmation)</Text>
          <Text><Text bold>S</Text>               Copy SSH command (VMs tab)</Text>
          <Text><Text bold>?</Text>               Toggle this help</Text>
          <Text />
          <Text dimColor>Press ? to close</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={rows} width={columns}>
      <Header config={config} vmCount={vmCount} diskCount={diskCount} />
      <TabBar tabs={TABS} activeTab={activeTab} />
      <Box borderStyle="single" borderTop={false} flexDirection="column" flexGrow={1}>
        {activeTab === "VMs" && <VMsScreen active={activeTab === "VMs"} contentHeight={contentHeight} terminalWidth={columns} />}
        {activeTab === "Costs" && <CostsScreen active={activeTab === "Costs"} contentHeight={contentHeight} terminalWidth={columns} />}
        {activeTab === "Keys" && <KeysScreen active={activeTab === "Keys"} />}
        {activeTab === "Disks" && <DisksScreen active={activeTab === "Disks"} />}
        {activeTab === "Firewall" && <FirewallScreen active={activeTab === "Firewall"} />}
        {activeTab === "Metrics" && <MetricsScreen active={activeTab === "Metrics"} config={config} />}
      </Box>
      <KeyHint
        hints={[
          { key: "q", label: "quit" },
          { key: "Tab", label: "switch" },
          { key: "r", label: "refresh" },
          { key: "?", label: "help" },
        ]}
      />
    </Box>
  );
}

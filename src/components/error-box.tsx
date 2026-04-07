import React from "react";
import { Box, Text } from "ink";

interface ErrorBoxProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBox({ message }: ErrorBoxProps) {
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text color="red" bold>Error</Text>
      <Text color="red">{message}</Text>
      <Text dimColor>Press r to retry</Text>
    </Box>
  );
}

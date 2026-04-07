import React from "react";
import { Box, Text, useInput } from "ink";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  useInput((input) => {
    if (input === "y" || input === "Y") {
      onConfirm();
    } else if (input === "n" || input === "N" || input === "q") {
      onCancel();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="yellow"
      paddingX={2}
      paddingY={1}
    >
      <Text color="yellow" bold>Confirm</Text>
      <Text>{message}</Text>
      <Box marginTop={1}>
        <Text>Press </Text>
        <Text bold color="green">y</Text>
        <Text> to confirm, </Text>
        <Text bold color="red">n</Text>
        <Text> to cancel</Text>
      </Box>
    </Box>
  );
}

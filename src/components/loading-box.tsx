import React from "react";
import { Box, Text } from "ink";
import { Spinner } from "@inkjs/ui";

interface LoadingBoxProps {
  message?: string;
}

export function LoadingBox({ message = "Loading..." }: LoadingBoxProps) {
  return (
    <Box paddingX={2} paddingY={1}>
      <Spinner label={message} />
    </Box>
  );
}

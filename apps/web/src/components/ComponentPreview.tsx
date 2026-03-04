"use client";

import { buildSandboxHtml } from "@/lib/sandbox";

interface Props {
  component: {
    codeJsx?: string | null;
    codeHtml?: string | null;
    codeCss?: string | null;
    codeJs?: string | null;
  };
  height?: number;
  forceMode?: "jsx" | "html";
}

export function ComponentPreview({
  component,
  height = 300,
  forceMode,
}: Props) {
  const srcdoc = buildSandboxHtml({
    mode: forceMode,
    codeJsx: component.codeJsx,
    codeHtml: component.codeHtml,
    codeCss: component.codeCss,
    codeJs: component.codeJs,
    theme: "dark",
  });

  return (
    <iframe
      srcDoc={srcdoc}
      sandbox="allow-scripts"
      style={{
        width: "100%",
        height: `${height}px`,
        borderRadius: "8px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-secondary)",
      }}
      title="Component Preview"
      loading="lazy"
    />
  );
}

"use client";

import Script from "next/script";

export default function Acessi() {
  return (
    <Script
      id="sienna-accessibility"
      src="https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js"
      strategy="afterInteractive"
      defer
    />
  );
}

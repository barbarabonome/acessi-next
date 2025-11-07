"use client";
import Script from "next/script";

export default function Acessi() {
  return (
    <Script
      id="sienna-widget"
      src="https://website-widgets.pages.dev/dist/sienna.min.js"
      strategy="afterInteractive"
      defer
    />
  );
}

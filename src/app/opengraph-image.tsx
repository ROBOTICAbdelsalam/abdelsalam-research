import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#08090b",
          color: "#f2f3f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              width: 22,
              height: 22,
              borderRadius: 9999,
              border: "3px solid #5b84ff",
            }}
          />
          <span style={{ fontSize: 24, letterSpacing: 2, color: "#9aa0aa" }}>
            {siteConfig.name.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 28, color: "#2dd4c8", letterSpacing: 3 }}>
            {siteConfig.positioning.toUpperCase()}
          </span>
          <span style={{ fontSize: 52, lineHeight: 1.15, maxWidth: 980 }}>
            AI & Robotics Engineer building intelligent systems across
            robotics, data and brain-computer interfaces.
          </span>
        </div>

        <div style={{ display: "flex", fontSize: 20, color: "#5b6068" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}

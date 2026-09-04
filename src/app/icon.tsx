import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090b",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            borderRadius: 9999,
            border: "2px solid #5b84ff",
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: 9999,
              background: "#2dd4c8",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}

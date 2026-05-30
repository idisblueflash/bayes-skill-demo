import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import chapters from "../../bayes-demo.chapters.json";

const ACCENT = "#A78BFA";       // jemma-purple accent
const ACCENT_SOFT = "#7C5CE0";
const DIM = "#3F3D56";
const BG = "rgba(20, 18, 35, 0.92)";
const TEXT_ACTIVE = "#FFFFFF";
const TEXT_DIM = "#9C9AB6";

export const Bar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chs = chapters.chapters;

  let currentIdx = chs.findIndex((c) => t >= c.start_sec && t < c.end_sec);
  if (currentIdx < 0) currentIdx = chs.length - 1;

  const current = chs[currentIdx];
  const chapterFrac = interpolate(
    t,
    [current.start_sec, current.end_sec],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "16px 56px",
        boxSizing: "border-box",
        fontFamily:
          "'PingFang SC', 'Hiragino Sans GB', 'Helvetica Neue', Arial, sans-serif",
        color: TEXT_DIM,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {chs.map((c, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const dotBg = done || active ? ACCENT : DIM;
          const dotShadow = active
            ? `0 0 0 4px rgba(167,139,250,0.25)`
            : "none";
          return (
            <React.Fragment key={c.index}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    background: dotBg,
                    boxShadow: dotShadow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: done || active ? TEXT_ACTIVE : TEXT_DIM,
                  }}
                >
                  {c.index}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: active ? TEXT_ACTIVE : done ? "#C8C5E3" : TEXT_DIM,
                    fontWeight: active ? 700 : 500,
                    whiteSpace: "nowrap",
                    letterSpacing: 0.2,
                  }}
                >
                  {c.title}
                </div>
              </div>
              {i < chs.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: DIM,
                    margin: "0 12px 20px",
                    borderRadius: 2,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width:
                        i < currentIdx
                          ? "100%"
                          : i === currentIdx
                          ? `${chapterFrac * 100}%`
                          : "0%",
                      background: `linear-gradient(90deg, ${ACCENT_SOFT}, ${ACCENT})`,
                      transition: "width 0.2s linear",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

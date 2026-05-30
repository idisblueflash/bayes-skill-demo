import React from "react";
import { Composition } from "remotion";
import { Bar } from "./Bar";
import chapters from "../../bayes-demo.chapters.json";

const FPS = 30;

export const Root: React.FC = () => {
  return (
    <Composition
      id="Bar"
      component={Bar}
      durationInFrames={Math.ceil(chapters.video_duration_sec * FPS)}
      fps={FPS}
      width={1920}
      height={160}
    />
  );
};

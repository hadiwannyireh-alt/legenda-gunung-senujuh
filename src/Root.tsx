import React from "react";
import {Composition} from "remotion";
import {Senujuh, TOTAL_FRAMES} from "./Senujuh";
import {FPS} from "./lib/stopMotion";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Senujuh"
    component={Senujuh}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);

import { createContext, useContext, type ReactNode } from "react";
import type { VideoConfig } from "../types.js";

const VideoConfigContext = createContext<VideoConfig | null>(null);

export function VideoConfigProvider({
  config,
  children,
}: {
  config: VideoConfig;
  children: ReactNode;
}) {
  return (
    <VideoConfigContext.Provider value={config}>
      {children}
    </VideoConfigContext.Provider>
  );
}

export function useVideoConfigContext(): VideoConfig | null {
  return useContext(VideoConfigContext);
}

export { VideoConfigContext };

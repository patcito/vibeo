export interface AudioAsset {
  id: string;
  src: string;
  startFrame: number;
  durationInFrames: number;
  volume: number | VolumeFunction;
  playbackRate: number;
  trimBefore: number;
  trimAfter: number | null;
}

export interface AudioData {
  sampleRate: number;
  numberOfChannels: number;
  channelData: Float32Array[];
  durationInSeconds: number;
}

export interface MediaProps {
  src: string;
  volume?: number | VolumeFunction;
  playbackRate?: number;
  startFrom?: number;
  endAt?: number;
  muted?: boolean;
  loop?: boolean;
}

export type VolumeFunction = (frame: number) => number;

import type { PlayerEventType, PlayerEventMap, PlayerEventListener } from "./types.js";

export class PlayerEventEmitter {
  private listeners = new Map<PlayerEventType, Set<PlayerEventListener<PlayerEventType>>>();

  addEventListener<T extends PlayerEventType>(
    type: T,
    listener: PlayerEventListener<T>,
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as PlayerEventListener<PlayerEventType>);
  }

  removeEventListener<T extends PlayerEventType>(
    type: T,
    listener: PlayerEventListener<T>,
  ): void {
    this.listeners.get(type)?.delete(listener as PlayerEventListener<PlayerEventType>);
  }

  emit<T extends PlayerEventType>(type: T, detail: PlayerEventMap[T]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const listener of set) {
      listener(detail);
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Holds active camera/microphone MediaStreams so that
 * hardware indicator lights stay on for the game session.
 * Call releaseAll() on game end or reset.
 */

const activeStreams: MediaStream[] = [];

export function holdStream(stream: MediaStream): void {
  activeStreams.push(stream);
}

export function releaseAllStreams(): void {
  for (const stream of activeStreams) {
    stream.getTracks().forEach((t) => t.stop());
  }
  activeStreams.length = 0;
}

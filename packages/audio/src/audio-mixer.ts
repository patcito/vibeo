const INT16_MIN = -32768;
const INT16_MAX = 32767;

export function mixAudio(tracks: Int16Array[], expectedLength: number): Int16Array {
  const output = new Int16Array(expectedLength);

  for (const track of tracks) {
    const len = Math.min(track.length, expectedLength);
    for (let i = 0; i < len; i++) {
      const sum = output[i] + track[i];
      output[i] = sum < INT16_MIN ? INT16_MIN : sum > INT16_MAX ? INT16_MAX : sum;
    }
  }

  return output;
}

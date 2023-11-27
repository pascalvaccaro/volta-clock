const sineWave = (i: number, freq = 440) => Math.sin((i * Math.PI * 2) / freq);

export type Sound = Parameters<typeof Float32Array.prototype.map>[0];
export const lowBip: Sound = (val, i, arr) =>
  i > arr.length / 2 ? val : sineWave(i, 440);

export const highBip: Sound = (val, i, arr) =>
  i > arr.length / 2 ? val : sineWave(i, 110);

export const useSound = ({ sampleRate }: { sampleRate: number }) => {
  const context = new AudioContext({ sampleRate });
  const frames = new Float32Array(sampleRate);

  return (transformer: Sound, duration = 60) => {
    const buffer = context.createBuffer(1, frames.length, sampleRate);
    buffer.copyToChannel(frames.map(transformer), 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(context.destination);
    source.start(0, 0, duration);
    return source;
  };
};

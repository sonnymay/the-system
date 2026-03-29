function ac() {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
}

function tone(ctx: AudioContext, freq: number, start: number, duration: number, vol = 0.15, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = type; osc.frequency.value = freq
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(vol, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.start(start); osc.stop(start + duration)
}

export const sounds = {
  habitComplete() {
    try {
      const ctx = ac()
      tone(ctx, 880, ctx.currentTime, 0.25)
      tone(ctx, 1320, ctx.currentTime + 0.08, 0.2)
    } catch {}
  },
  taskComplete() {
    try {
      const ctx = ac()
      tone(ctx, 660, ctx.currentTime, 0.15, 0.2)
      tone(ctx, 990, ctx.currentTime + 0.06, 0.2, 0.15)
      tone(ctx, 1320, ctx.currentTime + 0.12, 0.25, 0.12)
    } catch {}
  },
  levelUp() {
    try {
      const ctx = ac()
      ;[523, 659, 784, 1047].forEach((f, i) => tone(ctx, f, ctx.currentTime + i * 0.11, 0.3, 0.18))
    } catch {}
  },
  rankUp() {
    try {
      const ctx = ac()
      ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone(ctx, f, ctx.currentTime + i * 0.09, 0.4, 0.22, 'triangle'))
    } catch {}
  },
}

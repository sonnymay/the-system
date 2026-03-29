import type { LocalProfile } from '../store/useStore'
import { RANK_CONFIG } from './types'
import type { HunterRank } from './types'

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export async function shareHunterCard(
  profile: LocalProfile,
  maxStreak: number,
  progressPercent: number,
) {
  const W = 390, H = 260, S = 2
  const canvas = document.createElement('canvas')
  canvas.width = W * S; canvas.height = H * S
  const ctx = canvas.getContext('2d')!
  ctx.scale(S, S)

  const rank = profile.hunter_rank as HunterRank
  const rc = RANK_CONFIG[rank]

  // Background
  ctx.fillStyle = '#111827'
  rr(ctx, 0, 0, W, H, 20)
  ctx.fill()

  // Subtle rank color accent strip at top
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0, rc.color + '40')
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  rr(ctx, 0, 0, W, 6, 0)
  ctx.fill()

  // Rank badge
  ctx.fillStyle = rc.color + '25'
  rr(ctx, 28, 32, 52, 52, 14)
  ctx.fill()
  ctx.fillStyle = rc.color
  ctx.font = 'bold 26px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(rank, 54, 67)

  // Name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px system-ui'
  ctx.textAlign = 'left'
  ctx.fillText(profile.username, 96, 56)

  // Title + level
  ctx.fillStyle = '#9ca3af'
  ctx.font = '14px system-ui'
  ctx.fillText(`${rc.title} · Level ${profile.level}`, 96, 76)

  // Identity quote
  ctx.fillStyle = rc.color + 'bb'
  ctx.font = 'italic 12px system-ui'
  ctx.fillText(`"${rc.identity}"`, 28, 112)

  // XP bar background
  ctx.fillStyle = '#1f2937'
  rr(ctx, 28, 128, W - 56, 6, 3)
  ctx.fill()
  // XP bar fill
  ctx.fillStyle = rc.color
  rr(ctx, 28, 128, Math.max(6, (W - 56) * progressPercent / 100), 6, 3)
  ctx.fill()

  // Stats
  ctx.fillStyle = '#6b7280'
  ctx.font = '13px system-ui'
  ctx.textAlign = 'left'
  const stats = []
  if (maxStreak > 0) stats.push(`🔥 ${maxStreak} day streak`)
  stats.push(`⚔️ ${profile.total_tasks_completed} completed`)
  ctx.fillText(stats.join('   '), 28, 158)

  // Branding
  ctx.fillStyle = '#374151'
  ctx.font = '11px system-ui'
  ctx.textAlign = 'right'
  ctx.fillText('THE SYSTEM', W - 28, H - 20)

  return new Promise<void>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve()
      const file = new File([blob], 'hunter-card.png', { type: 'image/png' })
      try {
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: `${profile.username} — ${rc.title}`, files: [file] })
        } else {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'hunter-card.png'; a.click()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      } catch {}
      resolve()
    }, 'image/png')
  })
}

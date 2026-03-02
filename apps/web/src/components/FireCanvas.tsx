'use client'

import { useEffect, useRef } from 'react'

interface FireCanvasProps {
    height?: number
}

const PALETTE = [
    null,
    '#b71c1c',
    '#d32f2f',
    '#e53935',
    '#f44336',
    '#ef6c00',
    '#fb8c00',
    '#ffa726',
    '#ffca28',
    '#ffee58',
    '#fff9c4',
]

const W = 72
const H = 24
const FPS = 10
const NUM_PEAKS = 7

export function FireCanvas({ height = 60 }: FireCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = W
        canvas.height = H

        const buf = new Uint8Array(W * H)
        const peaks: { x: number; vx: number; intensity: number }[] = []

        for (let i = 0; i < NUM_PEAKS; i++) {
            peaks.push({
                x: (i / NUM_PEAKS) * W + Math.random() * 4,
                vx: (Math.random() - 0.5) * 0.25,
                intensity: 0.5 + Math.random() * 0.5,
            })
        }

        // Seed bottom row
        for (let x = 0; x < W; x++) {
            buf[(H - 1) * W + x] = 10
        }

        const interval = 1000 / FPS
        let prev = Date.now()
        let raf: number

        function update() {
            for (const p of peaks) {
                p.x += p.vx + (Math.random() - 0.5) * 0.15
                if (p.x < 0) p.x += W
                if (p.x >= W) p.x -= W
            }

            for (let x = 0; x < W; x++) {
                const base = Math.random() > 0.05 ? 10 : 8
                buf[(H - 1) * W + x] = Math.min(10, base)
            }

            for (let y = 0; y < H - 1; y++) {
                for (let x = 0; x < W; x++) {
                    const below = buf[(y + 1) * W + x]
                    const belowL = buf[(y + 1) * W + Math.max(0, x - 1)]
                    const belowR = buf[(y + 1) * W + Math.min(W - 1, x + 1)]

                    let nearPeak = 0
                    for (const p of peaks) {
                        let dx = Math.abs(x - p.x)
                        if (dx > W / 2) dx = W - dx
                        nearPeak += p.intensity * Math.exp(-(dx * dx) / 4)
                    }
                    nearPeak = Math.min(nearPeak, 1)

                    const centerW = 1 + nearPeak * 2
                    const avg = (below * centerW + belowL + belowR) / (centerW + 2)
                    const baseCool = 1.1 + (1 - nearPeak) * 0.3
                    const cool = Math.random() * baseCool

                    buf[y * W + x] = Math.max(0, Math.floor(avg - cool))
                }
            }
        }

        function render() {
            ctx!.clearRect(0, 0, W, H)
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const v = buf[y * W + x]
                    if (v > 0) {
                        ctx!.fillStyle = PALETTE[v]!
                        ctx!.fillRect(x, y, 1, 1)
                    }
                }
            }
        }

        function loop() {
            const now = Date.now()
            if (now - prev >= interval) {
                prev = now
                update()
                render()
            }
            raf = requestAnimationFrame(loop)
        }

        loop()

        return () => cancelAnimationFrame(raf)
    }, [])

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: `${height}px`,
            overflow: 'hidden',
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                }}
            />
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '40%',
                background: 'linear-gradient(to top, rgba(255, 204, 0, 0.7), transparent)',
                pointerEvents: 'none',
            }} />
        </div>
    )
}

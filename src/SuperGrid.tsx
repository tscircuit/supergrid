import React, { useEffect, useRef } from "react"
import { type Matrix, applyToPoint, inverse } from "transformation-matrix"

export interface SuperGridProps {
  /**
   * Represents the transformation between world and screen coordinates
   */
  transform: Matrix
  width: number
  height: number
  screenSpaceCellSize?: number
  majorColor?: string
  minorColor?: string
}

export const SuperGrid = (props: SuperGridProps) => {
  const ref = useRef<HTMLCanvasElement>(null)
  const {
    majorColor = "rgba(0,0,0,0.2)",
    minorColor = "rgba(0,0,0,0.1)",
    width,
    height,
    screenSpaceCellSize = 200,
  } = props

  const cellScreenWidth = Math.ceil(width / screenSpaceCellSize) + 1
  const cellScreenHeight = Math.ceil(height / screenSpaceCellSize) + 1

  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext("2d")!
    if (!ctx) return

    const Z =
      screenSpaceCellSize / 10 ** Math.floor(Math.log10(props.transform.a))
    const Za = screenSpaceCellSize / 10 ** Math.log10(props.transform.a)
    const Zp = Za / Z

    function drawGridLines(
      z: number,
      start: { x: number; y: number },
      end: { x: number; y: number }
    ) {
      const cellSize = z
      let x: number, y: number
      let lineStart: { x: number; y: number }
      let lineEnd: { x: number; y: number }

      // Vertical Lines
      for (x = start.x; x <= end.x; x += cellSize) {
        lineStart = applyToPoint(props.transform, { x, y: start.y })
        lineEnd = applyToPoint(props.transform, { x, y: end.y })
        ctx.beginPath()
        ctx.moveTo(lineStart.x, lineStart.y)
        ctx.lineTo(lineEnd.x, lineEnd.y)
        ctx.stroke()
      }
      // Horizontal Lines
      for (y = start.y; y <= end.y; y += cellSize) {
        lineStart = applyToPoint(props.transform, { x: start.x, y })
        lineEnd = applyToPoint(props.transform, { x: end.x, y })
        ctx.beginPath()
        ctx.moveTo(lineStart.x, lineStart.y)
        ctx.lineTo(lineEnd.x, lineEnd.y)
        ctx.stroke()
      }
    }

    function drawGridText(
      z: number,
      start: { x: number; y: number },
      end: { x: number; y: number }
    ) {
      const cellSize = z
      let x: number, y: number
      let lineStart: { x: number; y: number }
      let lineEnd: { x: number; y: number }
      for (x = start.x; x <= end.x; x += cellSize) {
        for (y = start.y; y <= end.y; y += cellSize) {
          const point = applyToPoint(props.transform, { x, y })
          ctx.font = `12px sans-serif`
          ctx.fillText(
            `${x.toFixed(1)}, ${y.toFixed(1)}`,
            point.x + 2,
            point.y - 2
          )
        }
      }
    }

    ctx.clearRect(0, 0, width, height)

    const topLeft = applyToPoint(inverse(props.transform), { x: 0, y: 0 })

    const zRoundedOffsetTopLeft = {
      x: Math.floor((topLeft.x - Z) / Z) * Z,
      y: Math.floor((topLeft.y - Z) / Z) * Z,
    }
    const zRoundedOffsetBottomRight = {
      x: zRoundedOffsetTopLeft.x + Z * cellScreenWidth,
      y: zRoundedOffsetTopLeft.y + Z * cellScreenHeight,
    }

    const textN = 5
    const NZ = Z * textN
    const NZRoundedOffsetTopLeft = {
      x: Math.floor((topLeft.x - NZ) / NZ) * NZ,
      y: Math.floor((topLeft.y - NZ) / NZ) * NZ,
    }
    const NZRoundedOffsetBottomRight = {
      x: NZRoundedOffsetTopLeft.x + NZ * cellScreenWidth,
      y: NZRoundedOffsetTopLeft.y + NZ * cellScreenHeight,
    }

    ctx.globalAlpha = 1
    ctx.strokeStyle = majorColor
    drawGridLines(Z, zRoundedOffsetTopLeft, zRoundedOffsetBottomRight)
    drawGridText(NZ, NZRoundedOffsetTopLeft, NZRoundedOffsetBottomRight)
    ctx.globalAlpha = 1 - Zp
    ctx.strokeStyle = minorColor
    drawGridLines(Z / 10, zRoundedOffsetTopLeft, zRoundedOffsetBottomRight)
    ctx.globalAlpha = Math.max((1 - Zp) * 10 - 8, 0)
    drawGridText(NZ / 10, NZRoundedOffsetTopLeft, NZRoundedOffsetBottomRight)
  }, [ref, props.transform])

  return <canvas ref={ref} width={props.width} height={props.height} />
}

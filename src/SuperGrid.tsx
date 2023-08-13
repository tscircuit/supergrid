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
    screenSpaceCellSize = 50,
  } = props

  const cellScreenWidth = Math.ceil(width / screenSpaceCellSize)
  const cellScreenHeight = Math.ceil(height / screenSpaceCellSize)

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

      ctx.strokeStyle = majorColor
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

    ctx.clearRect(0, 0, width, height)

    const topLeft = applyToPoint(inverse(props.transform), { x: 0, y: 0 })
    const roundedOffsetTopLeft = {
      x: Math.floor((topLeft.x - Z) / Z) * Z,
      y: Math.floor((topLeft.y - Z) / Z) * Z,
    }
    const roundedOffsetBottomRight = {
      x: roundedOffsetTopLeft.x + Z * cellScreenWidth,
      y: roundedOffsetTopLeft.y + Z * cellScreenHeight,
    }

    ctx.globalAlpha = 1
    drawGridLines(Z, roundedOffsetTopLeft, roundedOffsetBottomRight)
    ctx.globalAlpha = 1 - Zp
    drawGridLines(Z / 10, roundedOffsetTopLeft, roundedOffsetBottomRight)

    // Label major grid line intersections
    // ctx.fillStyle = majorColor
    // for (let i = 0; i <= majorGridLines; i++) {
    //   const x = i * majorGridCellSize
    //   const point = applyToPoint(props.transform, { x, y: 0 })
    //   ctx.fillText(`(${x.toFixed(2)}, 0)`, point.x, point.y)
    // }
  }, [ref, props.transform])

  return <canvas ref={ref} width={props.width} height={props.height} />
}

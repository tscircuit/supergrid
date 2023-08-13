import React, { useEffect, useRef, useState } from "react"
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
  stringifyCoord?: (x: number, y: number, cellSize?: number) => string
}

function roundPointToZ(Z: number, position: { x: number; y: number }) {
  return {
    x: Math.round(position.x / Z) * Z,
    y: Math.round(position.y / Z) * Z,
  }
}

function toSI(value: number, Z: number = 1): string {
  if (value < 0.0001) return "0m"
  if (value < 0) return "-" + toSI(-value)

  if (value > 1e3) return Math.floor(value / 1000) + "km"
  if (value > 1 && Z > 1) return Math.round(value) + "m"
  if (value > 1 && Z <= 1) return value.toFixed(Math.ceil(-Math.log10(Z))) + "m"
  if (value < 1 && Z >= 1 / 1000) return Math.round(value * 1000) + "mm"
  if (value < 1 && Z < 1 / 1000)
    return (value * 1000).toFixed(Math.ceil(-Math.log10(Z * 1000))) + "mm"
  return ""
}

export const SuperGrid = (props: SuperGridProps) => {
  const ref = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const {
    majorColor = "rgba(0,0,0,0.2)",
    minorColor = "rgba(0,0,0,0.1)",
    width,
    height,
    screenSpaceCellSize = 200,
    stringifyCoord = (x, y, Z) => `${toSI(x, Z)}, ${toSI(y, Z)}`,
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
      for (x = start.x; x <= end.x; x += cellSize) {
        for (y = start.y; y <= end.y; y += cellSize) {
          const point = applyToPoint(props.transform, { x, y })
          ctx.font = `12px sans-serif`
          ctx.fillText(stringifyCoord(x, y, z), point.x + 2, point.y - 2)
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
    drawGridLines(NZ / 10, NZRoundedOffsetTopLeft, NZRoundedOffsetBottomRight)
    ctx.globalAlpha = 1 - Zp
    ctx.strokeStyle = minorColor
    drawGridLines(Z / 10, zRoundedOffsetTopLeft, zRoundedOffsetBottomRight)
    ctx.globalAlpha = Math.max(((1 - Zp) * 10 - 5) / 5, 0)
    drawGridText(NZ / 10, NZRoundedOffsetTopLeft, NZRoundedOffsetBottomRight)

    ctx.globalAlpha = 0.5
    const projMousePos = applyToPoint(props.transform, mousePos)
    ctx.font = `12px sans-serif`
    ctx.fillText(
      stringifyCoord(mousePos.x, mousePos.y, Z),
      projMousePos.x + 2,
      projMousePos.y - 2
    )
    ctx.strokeStyle = majorColor
    ctx.strokeRect(projMousePos.x - 5, projMousePos.y - 5, 10, 10)
  }, [ref, props.transform, mousePos])

  return (
    <canvas
      onMouseUp={(e) => {
        if (!ref.current) return
        if (e.button !== 1) return
        const Z =
          screenSpaceCellSize /
          10 /
          10 ** Math.floor(Math.log10(props.transform.a))
        const rect = ref.current.getBoundingClientRect()
        const projM = applyToPoint(inverse(props.transform), {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        const m = roundPointToZ(Z, projM)
        setMousePos(m)
      }}
      ref={ref}
      width={props.width}
      height={props.height}
    />
  )
}

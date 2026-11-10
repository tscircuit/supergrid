import { describe, expect, test } from "bun:test"
import { toMeterSI, toMMSI } from "../src/SuperGrid"

describe("toMeterSI", () => {
  for (const [cellSize, expected] of [
    [10, "1m"],
    [1, "1m"],
    [0.1, "1.0m"],
    [0.01, "1.00m"],
  ]) {
    test(`formats the one-meter boundary at cell size ${cellSize}`, () => {
      expect(toMeterSI(1, cellSize)).toBe(expected)
      expect(toMeterSI(-1, cellSize)).toBe(`-${expected}`)
    })
  }

  for (const [value, cellSize, expected] of [
    [-2.5, 0.1, "-2.5m"],
    [-2.125, 0.01, "-2.13m"],
    [-0.00125, 0.0001, "-1.3mm"],
    [-0.00125, 0.00001, "-1.25mm"],
  ]) {
    test(`preserves precision for ${value} at cell size ${cellSize}`, () => {
      expect(toMeterSI(value, cellSize)).toBe(expected)
    })
  }

  for (const [value, cellSize, expected] of [
    [0, 1, "0m"],
    [0.0000001, 1, "0m"],
    [0.5, 1, "500mm"],
    [0.00125, 0.0001, "1.3mm"],
    [0.00125, 0.00001, "1.25mm"],
    [2.5, 0.1, "2.5m"],
    [2.125, 0.01, "2.13m"],
    [20, 10, "20m"],
    [1000, 10, "1000m"],
    [2000, 10, "2km"],
    [-0.5, 1, "-500mm"],
    [-2000, 10, "-2km"],
  ]) {
    test(`preserves existing formatting for ${value} at cell size ${cellSize}`, () => {
      expect(toMeterSI(value, cellSize)).toBe(expected)
    })
  }
})

describe("toMMSI", () => {
  test("formats exactly one meter from millimeter input", () => {
    expect(toMMSI(1000, 100)).toBe("1.0m")
    expect(toMMSI(-1000, 100)).toBe("-1.0m")
  })

  test("preserves negative submillimeter precision", () => {
    expect(toMMSI(-1.25, 0.01)).toBe("-1.25mm")
    expect(toMMSI(1.25, 0.01)).toBe("1.25mm")
  })
})

import { describe, test, expect } from "vitest"
import { toMeterSI, toMMSI } from "../src/SuperGrid"

describe("toMeterSI", () => {
  test("formats exactly 1 meter instead of an empty string", () => {
    expect(toMeterSI(1)).toBe("1m")
  })

  test("formats exactly -1 meter instead of a bare minus sign", () => {
    expect(toMeterSI(-1)).toBe("-1m")
  })

  test("keeps the cell size precision for negative values", () => {
    // the negative branch used to recurse without passing Z, losing precision
    expect(toMeterSI(-0.0005, 0.0001)).toBe("-0.5mm")
  })

  test("positive control cases are unchanged", () => {
    expect(toMeterSI(2)).toBe("2m")
    expect(toMeterSI(0.5)).toBe("500mm")
    expect(toMeterSI(0.0005, 0.0001)).toBe("0.5mm")
    expect(toMeterSI(0)).toBe("0m")
  })

  test("toMMSI converts millimeters at exact meter boundaries", () => {
    expect(toMMSI(1000)).not.toBe("")
    expect(toMMSI(-1000)).not.toBe("-")
  })
})

# react-supergrid

Easily create a grid with infinitely nesting subgrid cells.

![gif of grid](https://user-images.githubusercontent.com/1910070/260363547-3bacbace-d6cc-42e3-b1f4-62ab173f218b.gif)

```ts
import React from "react"
import { SuperGrid } from "react-supergrid"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"

export const MyApp = () => {
  const { transform, ref } = useMouseMatrixTransform()

  return (
    <div ref={ref}>
      <SuperGrid width={1000} height={1000} transform={transform} />
    </div>
  )
}
```

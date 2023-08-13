# supergrid

Easily create a grid with infinitely nesting subgrid cells.

```ts
import React from "react"
import { SuperGrid } from "supergrid"
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

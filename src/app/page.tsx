import { useState, useRef, useCallback } from "react";

export default function GridSelection() {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPixel, setStartPixel] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [currentPixel, setCurrentPixel] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellsInSelectionBox = useCallback(
    (
      startPixel: { x: number; y: number },
      endPixel: { x: number; y: number }
    ) => {
      if (!gridRef.current) return new Set<string>();

      const rect = gridRef.current.getBoundingClientRect();
      const cells = new Set<string>();

      const minX = Math.min(startPixel.x, endPixel.x);
      const maxX = Math.max(startPixel.x, endPixel.x);
      const minY = Math.min(startPixel.y, endPixel.y);
      const maxY = Math.max(startPixel.y, endPixel.y);
      const startGridX = Math.max(0, Math.floor((minX - rect.left) / 20));
      const endGridX = Math.min(9, Math.floor((maxX - rect.left) / 20));
      const startGridY = Math.max(0, Math.floor((minY - rect.top) / 20));
      const endGridY = Math.min(9, Math.floor((maxY - rect.top) / 20));

      for (let x = startGridX; x <= endGridX; x++) {
        for (let y = startGridY; y <= endGridY; y++) {
          if (x >= 0 && x < 10 && y >= 0 && y < 10) {
            const cellLeft = rect.left + x * 20;
            const cellRight = cellLeft + 20;
            const cellTop = rect.top + y * 20;
            const cellBottom = cellTop + 20;

            if (
              cellRight > minX &&
              cellLeft < maxX &&
              cellBottom > minY &&
              cellTop < maxY
            ) {
              cells.add(`${x}-${y}`);
            }
          }
        }
      }
      return cells;
    },
    []
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const pixelPos = { x: e.clientX, y: e.clientY };
    setStartPixel(pixelPos);
    setCurrentPixel(pixelPos);
    setIsSelecting(true);
    setSelectedCells(new Set());
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isSelecting) return;
      const pixelPos = { x: e.clientX, y: e.clientY };
      setCurrentPixel(pixelPos);
    },
    [isSelecting]
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    const finalSelection = getCellsInSelectionBox(startPixel, currentPixel);
    setSelectedCells(finalSelection);
    setIsSelecting(false);
  }, [isSelecting, startPixel, currentPixel, getCellsInSelectionBox]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current?.contains(e.target as Node)) {
      setSelectedCells(new Set());
    }
  }, []);

  const currentSelection = isSelecting
    ? getCellsInSelectionBox(startPixel, currentPixel)
    : new Set();

  const getSelectionBoxStyle = (): React.CSSProperties => {
    if (!isSelecting) return { display: "none" };

    const minX = Math.min(startPixel.x, currentPixel.x);
    const maxX = Math.max(startPixel.x, currentPixel.x);
    const minY = Math.min(startPixel.y, currentPixel.y);
    const maxY = Math.max(startPixel.y, currentPixel.y);

    return {
      position: "fixed" as const,
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
      pointerEvents: "none" as const,
      zIndex: 9999,
    };
  };

  return (
    <div
      className="p-8 select-none min-h-screen w-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {isSelecting && (
        <div
          className="border-2 border-dashed border-gray-800"
          style={getSelectionBoxStyle()}
        />
      )}
      <div ref={gridRef} className="inline-block relative">
        {Array.from({ length: 10 }, (_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: 10 }, (_, x) => {
              const cellId = `${x}-${y}`;
              const isSelected = selectedCells.has(cellId);
              const isCurrentlySelecting = currentSelection.has(cellId);

              return (
                <div
                  key={cellId}
                  className={`w-5 h-5 border border-black ${
                    isSelected || isCurrentlySelecting
                      ? "bg-orange-600"
                      : "bg-white"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef } from "react";
import Konva from "konva";
import { Ellipse, Image as KonvaImage, Layer, Rect, Stage, Transformer } from "react-konva";
import useImage from "use-image";
import type { Backdrop, SceneItem } from "@/data/sceneItems";
import { getSceneItem } from "@/data/sceneItems";
import {
  clampToFloor,
  clampToWidth,
  clampedScaleAt,
  shadowFor,
  sortByDepth,
  spriteSize,
} from "@/lib/sceneGeometry";

/**
 * Without this, Konva stops firing events on a node mid-drag as a performance
 * measure — which on touch means the drag dies the moment your finger moves.
 * It is the single most common reason a Konva canvas "works on desktop only".
 */
Konva.hitOnDragEnabled = true;

export type PlacedItem = {
  /** Instance id — an item can be placed many times. */
  uid: string;
  itemId: string;
  variantId: string;
  /** World coordinates of the GROUND CONTACT point, not the sprite's corner. */
  x: number;
  y: number;
  rotation: number;
};

type Props = {
  backdrop: Backdrop;
  items: PlacedItem[];
  selectedUid: string | null;
  onSelect: (uid: string | null) => void;
  onChange: (uid: string, patch: Partial<PlacedItem>) => void;
  /** Container width in CSS pixels; the stage scales the world to fit it. */
  containerWidth: number;
  stageRef?: React.MutableRefObject<Konva.Stage | null>;
};

/** Resolve a placed item to its sprite source, falling back to variant one. */
function useVariantImage(item: SceneItem | undefined, variantId: string) {
  const variant =
    item?.variants.find((v) => v.id === variantId) ?? item?.variants[0];
  // crossOrigin MUST be set before src, which use-image handles internally —
  // getting this wrong taints the canvas and breaks export in production only.
  const [img] = useImage(variant?.src ?? "", "anonymous");
  return img;
}

const Sprite = ({
  placed,
  backdrop,
  onSelect,
  onChange,
  nodeRef,
}: {
  placed: PlacedItem;
  backdrop: Backdrop;
  onSelect: () => void;
  onChange: (patch: Partial<PlacedItem>) => void;
  nodeRef?: (node: Konva.Image | null) => void;
}) => {
  const item = getSceneItem(placed.itemId);
  const img = useVariantImage(item, placed.variantId);

  if (!item || !img) return null;

  const ratio = img.naturalWidth / img.naturalHeight || 1;
  const { width, height } = spriteSize(backdrop, item, placed.y, ratio);

  return (
    <KonvaImage
      ref={nodeRef}
      image={img}
      x={placed.x}
      y={placed.y}
      width={width}
      height={height}
      rotation={placed.rotation}
      // The offset is the whole trick: it puts the node's origin on the point
      // where the furniture meets the floor, so `x`/`y` IS the ground contact
      // and rotation pivots there instead of around the image's centre. Without
      // it, rotating a sofa swings it off the ground.
      offsetX={width * item.anchor.x}
      offsetY={height * item.anchor.y}
      draggable
      onMouseDown={onSelect}
      onTouchStart={onSelect}
      dragBoundFunc={(pos) => ({
        x: clampToWidth(backdrop, pos.x),
        y: clampToFloor(backdrop, pos.y),
      })}
      // Commit on dragend only. Writing state on every dragmove is 60 React
      // renders a second and drops frames on a mid-range phone.
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Image;
        // The transformer writes scale, never width/height. Fold it back in and
        // reset, or every subsequent size calculation compounds.
        node.scaleX(1);
        node.scaleY(1);
        onChange({ rotation: node.rotation() });
      }}
      shadowForStrokeEnabled={false}
      perfectDrawEnabled={false}
    />
  );
};

const SceneCanvas = ({
  backdrop,
  items,
  selectedUid,
  onSelect,
  onChange,
  containerWidth,
  stageRef,
}: Props) => {
  const [bgImage] = useImage(backdrop.src, "anonymous");
  const trRef = useRef<Konva.Transformer | null>(null);
  const nodeRefs = useRef(new Map<string, Konva.Image>());

  // Fit the world to the container. Everything downstream works in world units,
  // so a saved layout replays identically at any screen size.
  const scale = containerWidth > 0 ? containerWidth / backdrop.width : 1;

  const ordered = useMemo(() => sortByDepth(items), [items]);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedUid ? nodeRefs.current.get(selectedUid) : null;
    tr.nodes(node ? [node] : []);
    // Konva doesn't reposition the transformer box when the node it's attached
    // to has an offset until something touches a handle.
    tr.forceUpdate();
    tr.getLayer()?.batchDraw();
  }, [selectedUid, items]);

  return (
    <Stage
      ref={(node) => {
        if (stageRef) stageRef.current = node;
      }}
      width={backdrop.width * scale}
      height={backdrop.height * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(e) => {
        // Konva fires pointer events on shapes only; a click on empty canvas
        // arrives on the stage itself.
        if (e.target === e.target.getStage()) onSelect(null);
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage()) onSelect(null);
      }}
    >
      {/* Backdrop: drawn once, never listens for events. */}
      <Layer listening={false}>
        {bgImage && (
          <KonvaImage
            image={bgImage}
            width={backdrop.width}
            height={backdrop.height}
          />
        )}
      </Layer>

      {/* Shadows live on their own layer UNDER every sprite, so one item's
          shadow can never be drawn on top of another item. */}
      <Layer listening={false}>
        {ordered.map((p) => {
          const item = getSceneItem(p.itemId);
          if (!item) return null;
          const s = clampedScaleAt(backdrop, p.y);
          const width = (item.realWidthCm / 100) * backdrop.pxPerMetreAtRef * s;
          const sh = shadowFor(width, s);
          return (
            <Ellipse
              key={`shadow-${p.uid}`}
              x={p.x}
              y={p.y}
              radiusX={sh.radiusX}
              radiusY={sh.radiusY}
              // Warm near-black. Pure #000 reads as digital rather than as a
              // shadow cast on a warm stone or timber floor.
              fill="rgb(20,18,14)"
              opacity={sh.opacity}
              perfectDrawEnabled={false}
            />
          );
        })}
      </Layer>

      {/* The only interactive layer. */}
      <Layer>
        {ordered.map((p) => (
          <Sprite
            key={p.uid}
            placed={p}
            backdrop={backdrop}
            onSelect={() => onSelect(p.uid)}
            onChange={(patch) => onChange(p.uid, patch)}
            nodeRef={(node) => {
              if (node) nodeRefs.current.set(p.uid, node);
              else nodeRefs.current.delete(p.uid);
            }}
          />
        ))}
      </Layer>

      {/* Scene glaze: one wash of the plate's ambient colour over everything,
          which is what stops cut-outs looking pasted on. Kept under 7% —
          above that the products go muddy. */}
      <Layer listening={false}>
        <Rect
          width={backdrop.width}
          height={backdrop.height}
          fill={backdrop.glaze}
          opacity={0.06}
          globalCompositeOperation="soft-light"
        />
      </Layer>

      {/* UI layer: small, redraws often, isolated from the sprites. */}
      <Layer>
        <Transformer
          ref={trRef}
          rotateEnabled
          resizeEnabled={false}
          // Size is owned by where the item stands on the floor, so there are no
          // resize handles at all. Letting people scale furniture freely is what
          // turns a plausible scene into a collage.
          enabledAnchors={[]}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotateAnchorOffset={40}
          anchorSize={22}
          borderStroke="#ffffff"
          borderStrokeWidth={2}
          anchorStroke="#2f2f2f"
          anchorFill="#ffffff"
        />
      </Layer>
    </Stage>
  );
};

export default SceneCanvas;

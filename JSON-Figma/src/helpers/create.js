import { hexToFigmaColor } from './color.js';

export const createFrame = (node, element) => {
  node = figma.createFrame();
  node.name = element.tag;
  node.clipsContent = true;

  const bg = element.computed_styles?.backgroundColor;
  const hasBg = bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";

  node.fills = hasBg
    ? [{ type: "SOLID", color: hexToFigmaColor(bg) }]
    : [];

  node.opacity = parseFloat(element.computed_styles?.opacity) || 1;

  const borderRadius = parseFloat(element.computed_styles?.borderRadius);
  if (borderRadius > 0) {
    node.cornerRadius = borderRadius;
  }

  // Apply auto-layout if the original element used flexbox
  const flexDirection = element.computed_styles?.flexDirection;
  if (flexDirection && flexDirection !== "none") {
    const hasFlexChildren = element.children?.some(child =>
      child.computed_styles?.display === "flex" || child.computed_styles?.display === "inline-flex"
    );
    if (!hasFlexChildren) {
      node.layoutMode = flexDirection === "column" ? "VERTICAL" : "HORIZONTAL";
      node.counterAxisSizingMode = "AUTO";
      node.primaryAxisSizingMode = "AUTO";

      if (element.computed_styles?.justifyContent) {
        node.primaryAxisAlignItems = convertJustifyContent(element.computed_styles.justifyContent);
      }
      if (element.computed_styles?.alignItems) {
        node.counterAxisAlignItems = convertAlignItems(element.computed_styles.alignItems);
      }

      if (element.computed_styles?.gap) {
        const gap = parseFloat(element.computed_styles.gap);
        if (gap > 0) {
          node.itemSpacing = gap;
        }
      } else if (element.computed_styles?.rowGap) {
        const gap = parseFloat(element.computed_styles.rowGap);
        if (gap > 0) {
          node.itemSpacing = gap;
        }
      }
    } else {
      node.layoutMode = "NONE";
    }
  } else {
    node.layoutMode = "NONE";
  }

  return node;
};

function convertJustifyContent(value) {
  const map = {
    "flex-start": "MIN",
    "center": "CENTER",
    "flex-end": "MAX",
    "space-between": "SPACE_BETWEEN",
    "space-around": "SPACE_AROUND",
    "space-evenly": "SPACE_EVENLY"
  };
  return map[value] || "MIN";
}

function convertAlignItems(value) {
  const map = {
    "flex-start": "MIN",
    "start": "MIN",
    "center": "CENTER",
    "flex-end": "MAX",
    "end": "MAX",
    "stretch": "STRETCH",
    "baseline": "MIN"
  };
  return map[value] || "MIN";
}

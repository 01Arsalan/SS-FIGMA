export const positionElement = (element, parent, node) => {
  if (!element.bounding_rect) return;

  const { left = 0, top = 0, width = 100, height = 10 } = element.bounding_rect;

  const nodeWidth = Math.max(parseFloat(width) || 100, 5);
  const nodeHeight = Math.max(parseFloat(height) || 10, 5);

  node.resize(nodeWidth, nodeHeight);

  if (parent && parent.type !== "PAGE") {
    const parentTransform = parent.absoluteTransform;
    if (parentTransform) {
      const parentX = parentTransform[0]?.[2] || 0;
      const parentY = parentTransform[1]?.[2] || 0;

      const isSpan = element.tag === "span";
      node.x = (parseFloat(left) || 0) - parentX;
      node.y = (parseFloat(top) || 0) - (isSpan ? parentY - 5 : parentY);
    } else {
      node.x = parseFloat(left) || 0;
      node.y = parseFloat(top) || 0;
    }

    if (parent.resize) {
      parent.resize(
        Math.max(parent.width, node.x + nodeWidth),
        Math.max(parent.height, node.y + nodeHeight)
      );
    }
  } else {
    node.x = parseFloat(left) || 0;
    node.y = parseFloat(top) || 0;
  }
};

export const addPadding = (node, element) => {
  const cs = element.computed_styles || {};
  node.paddingLeft = parseFloat(cs.paddingLeft) || 0;
  node.paddingRight = parseFloat(cs.paddingRight) || 0;
  node.paddingTop = parseFloat(cs.paddingTop) || 0;
  node.paddingBottom = parseFloat(cs.paddingBottom) || 0;
};

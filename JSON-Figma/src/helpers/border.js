import { hexToFigmaColor } from './color';

export const applyBorders = (node, computedStyles) => {
  if (!computedStyles) return;

  const borderWidth = parseFloat(computedStyles.borderWidth) || 0;
  const borderColor = computedStyles.borderColor
    ? hexToFigmaColor(computedStyles.borderColor)
    : { r: 0, g: 0, b: 0 };

  const hasBorders = borderWidth > 0;

  if (hasBorders) {
    node.strokes = [{
      type: "SOLID",
      color: borderColor
    }];
    node.strokeWeight = borderWidth;
    return;
  }

  const borderTop = parseFloat(computedStyles.borderTop?.split(" ")[0]) || 0;
  const borderRight = parseFloat(computedStyles.borderRight?.split(" ")[0]) || 0;
  const borderBottom = parseFloat(computedStyles.borderBottom?.split(" ")[0]) || 0;
  const borderLeft = parseFloat(computedStyles.borderLeft?.split(" ")[0]) || 0;

  if (borderTop || borderRight || borderBottom || borderLeft) {
    applyIndividualBorders(node, {
      top: borderTop,
      right: borderRight,
      bottom: borderBottom,
      left: borderLeft
    }, borderColor);
  }
};

const applyIndividualBorders = (node, borders, color) => {
  const lines = [];
  const { width, height } = node;

  if (borders.top > 0) {
    const topBorder = figma.createRectangle();
    topBorder.resize(width, borders.top);
    topBorder.x = 0;
    topBorder.y = 0;
    topBorder.fills = [{ type: "SOLID", color }];
    topBorder.name = "border-top";
    lines.push(topBorder);
  }

  if (borders.right > 0) {
    const rightBorder = figma.createRectangle();
    rightBorder.resize(borders.right, height);
    rightBorder.x = width - borders.right;
    rightBorder.y = 0;
    rightBorder.fills = [{ type: "SOLID", color }];
    rightBorder.name = "border-right";
    lines.push(rightBorder);
  }

  if (borders.bottom > 0) {
    const bottomBorder = figma.createRectangle();
    bottomBorder.resize(width, borders.bottom);
    bottomBorder.x = 0;
    bottomBorder.y = height - borders.bottom;
    bottomBorder.fills = [{ type: "SOLID", color }];
    bottomBorder.name = "border-bottom";
    lines.push(bottomBorder);
  }

  if (borders.left > 0) {
    const leftBorder = figma.createRectangle();
    leftBorder.resize(borders.left, height);
    leftBorder.x = 0;
    leftBorder.y = 0;
    leftBorder.fills = [{ type: "SOLID", color }];
    leftBorder.name = "border-left";
    lines.push(leftBorder);
  }

  lines.forEach(line => {
    line.locked = true;
    node.appendChild(line);
  });
};

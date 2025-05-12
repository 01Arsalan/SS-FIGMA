import { hexToFigmaColor } from './color.js'
export const createFrame = (node, element) => {
    node = figma.createFrame();
    node.name = element.tag;

    node.fills = element.computed_styles.backgroundColor && element.computed_styles.backgroundColor !== "rgba(0, 0, 0, 0)"
        ? [{ type: "SOLID", color: hexToFigmaColor(element.computed_styles.backgroundColor) }]
        : [];

    node.opacity = parseFloat(element.computed_styles.opacity) || 1;

    node.cornerRadius = parseFloat(element.computed_styles.borderRadius) || 0;

    return node;
}
export const positionElement = (element, parent, node) => {
    if (!element.bounding_rect) return;

    const { left = 0, top = 0, width = 100, height = 10 } = element.bounding_rect;
    const nodeWidth = Math.max(parseFloat(width) || 100, 10);
    const nodeHeight = Math.max(parseFloat(height) || 10, 10);
    
    node.resize(nodeWidth, nodeHeight);

    if (parent.type !== "PAGE") {
        const [_, __, parentX = 0] = parent.absoluteTransform[0];
        const [___, ____, parentY = 0] = parent.absoluteTransform[1];

        node.x = (parseFloat(left) || 0) - parentX;
        node.y = (parseFloat(top) || 0) - (element.tag === "span" ? parentY - 5 : parentY);

        parent.resize(parent.width, Math.max(parent.height, node.y + nodeHeight));
    } else {
        node.x = parseFloat(left) || 0;
        node.y = parseFloat(top) || 0;
    }
};

export const addPadding = (node, element) => {
    node.paddingLeft = parseFloat(element.computed_styles.paddingLeft) || 0;
    node.paddingRight = parseFloat(element.computed_styles.paddingRight) || 0;
    node.paddingTop = parseFloat(element.computed_styles.paddingTop) || 0;
    node.paddingBottom = parseFloat(element.computed_styles.paddingBottom) || 0;
}

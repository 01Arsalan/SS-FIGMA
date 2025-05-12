import { hexToFigmaColor } from "./color";


export const createTextEl = async (textFrame, element, parent) => {
    const frameWidth = Math.max(parseFloat(element.bounding_rect.width) || 100, 10);
    const frameHeight = Math.max(parseFloat(element.bounding_rect.height) || 10, 10);
    textFrame.resize(frameWidth, frameHeight);

    const textNode = figma.createText();
    textNode.name = element.tag;

    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    textNode.characters = element.content || "";

    // Apply text-specific styles
    textNode.fontSize = parseFloat(element.computed_styles.fontSize) || 18;
    textNode.lineHeight = { value: parseFloat(element.computed_styles.lineHeight) || 24, unit: "PIXELS" };


    // text-weignt is causing text to wrap ar un-intended places
    // if (element.computed_styles.fontWeight) {
    //     const weight = parseInt(element.computed_styles.fontWeight);
    //     const style = weight >= 700 ? "Bold" : "Regular";
    //     await figma.loadFontAsync({ family: "Inter", style });
    //     textNode.fontName = { family: "Inter", style };
    // }
    if (element.computed_styles.fontWeight) {
        const style = "Regular";
        await figma.loadFontAsync({ family: "Inter", style });
        textNode.fontName = { family: "Inter", style };
    }

    textNode.fills = element.computed_styles.color
        ? [{ type: "SOLID", color: hexToFigmaColor(element.computed_styles.color) }]
        : [];

    if (textNode.width > frameWidth) {
        // Apply wrapping behavior
        configureTextWrapping(textNode, frameWidth, element.computed_styles, frameHeight, element.content || "");
        if (element.computed_styles.textAlign) textNode.textAlignHorizontal = convertTextAlign(element.computed_styles.textAlign);
    }

    // positioning textinside wrapper frame
    const textAlign = element.computed_styles.textAlign || "start";
    const verticalAlign = element.computed_styles.alignItems || "start";
    [textNode.x, textNode.y] = getOffsets(textNode, frameWidth, frameHeight, textAlign, verticalAlign, element.computed_styles);

    // Position the frame relative to its parent
    if (element.absolute_position) {
        const parentX = parent.type !== "PAGE" ? parent.absoluteTransform[0][2] : 0;
        const parentY = parent.type !== "PAGE" ? parent.absoluteTransform[1][2] : 0;

        textFrame.x = element.absolute_position.left - parentX;
        textFrame.y = element.absolute_position.top - parentY;
    }

    // Add the text node to the frame
    textFrame.appendChild(textNode);
}


export const getOffsets = (textNode, frameWidth, frameHeight, textAlign, verticalAlign, computedStyles) => {
    const horizontalAlignMap = {
        "start": parseFloat(computedStyles.paddingLeft) || 0,
        "left": parseFloat(computedStyles.paddingLeft) || 0,
        "center": (frameWidth - textNode.width) / 2,
        "right": frameWidth - textNode.width - (parseFloat(computedStyles.paddingRight) || 0),
        "end": frameWidth - textNode.width - (parseFloat(computedStyles.paddingRight) || 0)
    };

    const verticalAlignMap = {
        "flex-start": parseFloat(computedStyles.paddingTop) || 0,
        "start": parseFloat(computedStyles.paddingTop) || 0,
        "center": (frameHeight - textNode.height) / 2,
        "flex-end": frameHeight - textNode.height - (parseFloat(computedStyles.paddingBottom) || 0),
        "end": frameHeight - textNode.height - (parseFloat(computedStyles.paddingBottom) || 0)
    };

    const horizontalOffset = horizontalAlignMap[textAlign] !== undefined ? horizontalAlignMap[textAlign] : parseFloat(computedStyles.paddingLeft) || 0;
    const verticalOffset = verticalAlignMap[verticalAlign] !== undefined ? verticalAlignMap[verticalAlign] : parseFloat(computedStyles.paddingTop) || 0;

    return [horizontalOffset, verticalOffset];
};

export const convertTextAlign = (textAlign) => {
    const alignMap = {
        "left": "LEFT",
        "center": "CENTER",
        "right": "RIGHT",
        "justify": "JUSTIFIED",
        "start": "LEFT",
        "end": "RIGHT"
    };

    return alignMap[textAlign] || "LEFT";
}


export const configureTextWrapping = async (textNode, frameWidth, computedStyles, frameHeight) => {
    const textWrap = computedStyles.whiteSpace !== "nowrap";

    if (textWrap) {
        textNode.textAutoResize = "HEIGHT";
        textNode.resize(frameWidth, textNode.height);

        if (textNode.height > frameHeight && frameHeight > 0) {
            textNode.resize(frameWidth, frameHeight);

            textNode.textAutoResize = "WIDTH_AND_HEIGHT";

            const originalText = textNode.characters;
            textNode.characters = "";
            await figma.loadFontAsync(textNode.fontName);
            textNode.characters = originalText;
        }
    } else {
        textNode.textAutoResize = "WIDTH_AND_HEIGHT";
    }
}

export const isElementWithText = (element) => {
    const textContent = (element.content || "").trim();
    return (textContent.length > 0 &&  element.children.length === 0) || 
    ( element.children.length === 1 && element.children.some(child => ["svg"].includes(child.tag)));
}
// export const isElementWithText = (element) => {
//     const textContent = (element.content || "").trim();
//     return textContent.length > 0 && (!element.children || element.children.length === 0);
// }

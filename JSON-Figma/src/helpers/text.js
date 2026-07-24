import { hexToFigmaColor } from "./color";

const FONT_CACHE = new Set();

async function loadFont(family, style) {
  const key = `${family}-${style}`;
  if (FONT_CACHE.has(key)) return;
  try {
    await figma.loadFontAsync({ family, style });
    FONT_CACHE.add(key);
  } catch {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    } catch {
      // fallback silently
    }
  }
}

function parseFontFamily(fontFamily) {
  if (!fontFamily || fontFamily === "none") return "Inter";
  return fontFamily.split(",")[0].replace(/['"]/g, "").trim();
}

function getFontStyle(fontWeight, fontStyle) {
  const w = parseInt(fontWeight) || 400;
  if (w >= 700) return "Bold";
  if (fontStyle === "italic") return "Italic";
  return "Regular";
}

export const createTextEl = async (textFrame, element, parent) => {
  const frameWidth = Math.max(parseFloat(element.bounding_rect?.width) || 100, 10);
  const frameHeight = Math.max(parseFloat(element.bounding_rect?.height) || 10, 10);
  textFrame.resize(frameWidth, frameHeight);

  const textNode = figma.createText();
  textNode.name = `${element.tag}:text`;

  const family = parseFontFamily(element.computed_styles?.fontFamily);
  const style = getFontStyle(element.computed_styles?.fontWeight, element.computed_styles?.fontStyle);
  await loadFont(family, style);
  textNode.fontName = { family, style };

  textNode.characters = element.content || "";

  const fontSize = parseFloat(element.computed_styles?.fontSize) || 18;
  textNode.fontSize = Math.max(fontSize, 4);

  const lineHeightVal = parseFloat(element.computed_styles?.lineHeight) || fontSize * 1.4;
  textNode.lineHeight = { value: Math.max(lineHeightVal, fontSize), unit: "PIXELS" };

  if (element.computed_styles?.letterSpacing) {
    textNode.letterSpacing = { value: parseFloat(element.computed_styles.letterSpacing), unit: "PIXELS" };
  }

  const textDecoration = element.computed_styles?.textDecoration || "none";
  if (textDecoration === "underline") textNode.textDecoration = "UNDERLINE";
  if (textDecoration === "line-through") textNode.textDecoration = "STRIKETHROUGH";

  textNode.fills = element.computed_styles?.color
    ? [{ type: "SOLID", color: hexToFigmaColor(element.computed_styles.color) }]
    : [];

  if (element.computed_styles?.textAlign) {
    textNode.textAlignHorizontal = convertTextAlign(element.computed_styles.textAlign);
  }

  if (textNode.width > frameWidth) {
    configureTextWrapping(textNode, frameWidth, element.computed_styles, frameHeight);
  }

  const textAlign = element.computed_styles?.textAlign || "start";
  const verticalAlign = element.computed_styles?.alignItems || "start";
  [textNode.x, textNode.y] = getOffsets(textNode, frameWidth, frameHeight, textAlign, verticalAlign, element.computed_styles);

  if (element.absolute_position) {
    const parentX = parent.type !== "PAGE" ? parent.absoluteTransform[0][2] : 0;
    const parentY = parent.type !== "PAGE" ? parent.absoluteTransform[1][2] : 0;
    textFrame.x = element.absolute_position.left - parentX;
    textFrame.y = element.absolute_position.top - parentY;
  }

  textFrame.appendChild(textNode);
};

export const getOffsets = (textNode, frameWidth, frameHeight, textAlign, verticalAlign, computedStyles) => {
  const pl = parseFloat(computedStyles?.paddingLeft) || 0;
  const pr = parseFloat(computedStyles?.paddingRight) || 0;
  const pt = parseFloat(computedStyles?.paddingTop) || 0;
  const pb = parseFloat(computedStyles?.paddingBottom) || 0;

  const horizontalAlignMap = {
    "start": pl,
    "left": pl,
    "center": (frameWidth - textNode.width) / 2,
    "right": frameWidth - textNode.width - pr,
    "end": frameWidth - textNode.width - pr
  };

  const verticalAlignMap = {
    "flex-start": pt,
    "start": pt,
    "center": (frameHeight - textNode.height) / 2,
    "flex-end": frameHeight - textNode.height - pb,
    "end": frameHeight - textNode.height - pb
  };

  return [
    horizontalAlignMap[textAlign] ?? pl,
    verticalAlignMap[verticalAlign] ?? pt
  ];
};

export const convertTextAlign = (textAlign) => {
  const map = {
    "left": "LEFT",
    "center": "CENTER",
    "right": "RIGHT",
    "justify": "JUSTIFIED",
    "start": "LEFT",
    "end": "RIGHT"
  };
  return map[textAlign] || "LEFT";
};

export const configureTextWrapping = async (textNode, frameWidth, computedStyles, frameHeight) => {
  const textWrap = computedStyles?.whiteSpace !== "nowrap";

  if (textWrap) {
    textNode.textAutoResize = "HEIGHT";
    textNode.resize(frameWidth, textNode.height);

    if (textNode.height > frameHeight && frameHeight > 0) {
      textNode.resize(frameWidth, frameHeight);
      textNode.textAutoResize = "WIDTH_AND_HEIGHT";
      await figma.loadFontAsync(textNode.fontName);
    }
  } else {
    textNode.textAutoResize = "WIDTH_AND_HEIGHT";
  }
};

export const isElementWithText = (element) => {
  const textContent = (element.content || "").trim();
  return (textContent.length > 0 && element.children.length === 0) ||
    (element.children.length === 1 && element.children.some(child => ["svg"].includes(child.tag)));
};

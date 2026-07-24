import { applyBorders } from '../helpers/border.js';
import { isElementWithText, createTextEl } from "../helpers/text.js";
import { positionElement, addPadding } from '../helpers/position.js';
import { createFrame } from '../helpers/create.js';
import { hasImage, createImageElement } from '../helpers/images.js';

const BLOCK_TAGS = new Set(["nav", "div", "section", "main", "ul", "a", "li", "header", "footer", "article", "aside", "ol", "form", "figure", "details", "summary"]);
const TEXT_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a", "button", "i", "b", "strong", "em", "label", "figcaption", "cite", "q", "code", "pre"]);
const MEDIA_TAGS = new Set(["img", "svg", "picture", "video", "canvas"]);

export const createFigmaStructure = async (jsonData, parent = figma.currentPage, depth = 0, GP = { computed_styles: { display: 'null' } }) => {
  if (!Array.isArray(jsonData)) {
    console.error("Expected an array of JSON data.");
    return;
  }

  if (jsonData.length > 1) {
    jsonData.sort((a, b) => {
      const aZ = a.computed_styles?.zIndex || 0;
      const bZ = b.computed_styles?.zIndex || 0;
      return aZ - bZ;
    });
  }

  for (const element of jsonData) {
    if (element.computed_styles?.display === "none") continue;

    let node;
    const hasDirectText = isElementWithText(element);
    const isBlock = BLOCK_TAGS.has(element.tag);
    const isText = TEXT_TAGS.has(element.tag) || hasDirectText;
    const isMedia = MEDIA_TAGS.has(element.tag);

    if (element.tag === "body" || (isBlock && !hasDirectText)) {
      node = createFrame(node, element);
      node.layoutMode = "NONE";
      node.clipsContent = true;
      node.name = element.tag;

    } else if (isText) {
      if (parent.type === "TEXT") continue;

      const textFrame = createFrame(node, element);
      textFrame.name = `${element.tag}:wrapper`;
      textFrame.layoutMode = "NONE";

      await createTextEl(textFrame, element, parent);

      if (parent.type !== "TEXT") {
        parent.appendChild(textFrame);
      }
      node = textFrame;

    } else if (isMedia) {
      if (element.tag === "img") {
        const imgFrame = figma.createRectangle();
        imgFrame.name = "img";
        const w = Math.max(parseFloat(element.bounding_rect?.width) || 100, 10);
        const h = Math.max(parseFloat(element.bounding_rect?.height) || 10, 10);
        imgFrame.resize(w, h);

        const imageCreated = await createImageElement(imgFrame, element);
        if (!imageCreated) {
          imgFrame.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
        }
        node = imgFrame;
      } else {
        continue;
      }
    } else {
      continue;
    }

    if (parent && parent.type !== "TEXT") {
      parent.appendChild(node);
    }

    addPadding(node, element);
    positionElement(element, parent, node);

    if (element.tag !== "img") {
      applyBorders(node, element.computed_styles);
    }

    if (element.computed_styles?.borderRadius && !isMedia) {
      node.cornerRadius = parseFloat(element.computed_styles.borderRadius) || 0;
    }

    if (element.computed_styles?.boxShadow && element.computed_styles.boxShadow !== "none") {
      try {
        node.effects = [parseBoxShadow(element.computed_styles.boxShadow)];
      } catch (e) {
        // skip invalid shadow
      }
    }

    if (element.children && Array.isArray(element.children) && element.children.length > 0) {
      await createFigmaStructure(element.children, node, depth + 1, element);
    }
  }
};

function parseBoxShadow(shadowStr) {
  const parts = shadowStr.split(" ");
  const offsetX = parseFloat(parts[0]) || 0;
  const offsetY = parseFloat(parts[1]) || 0;
  const radius = parseFloat(parts[2]) || 0;
  const spread = parseFloat(parts[3]) || 0;
  const colorMatch = shadowStr.match(/rgba?\([^)]+\)|#[a-fA-F0-9]+/);
  const color = colorMatch ? { r: 0, g: 0, b: 0, a: 0.25 } : { r: 0, g: 0, b: 0, a: 0.25 };

  return {
    type: "DROP_SHADOW",
    color,
    offset: { x: offsetX, y: offsetY },
    radius,
    spread
  };
}

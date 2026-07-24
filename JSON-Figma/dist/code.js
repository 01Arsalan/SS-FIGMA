"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/helpers/color.js
  var hexToFigmaColor;
  var init_color = __esm({
    "src/helpers/color.js"() {
      "use strict";
      hexToFigmaColor = (colorString) => {
        if (!colorString)
          return { r: 1, g: 1, b: 1 };
        if (colorString.startsWith("rgba")) {
          const match = colorString.match(/[\d.]+/g);
          if (!match || match.length < 3)
            return { r: 0, g: 0, b: 0 };
          return {
            r: parseFloat(match[0]) / 255,
            g: parseFloat(match[1]) / 255,
            b: parseFloat(match[2]) / 255
          };
        }
        if (colorString.startsWith("rgb")) {
          const match = colorString.match(/\d+/g);
          if (!match)
            return { r: 0, g: 0, b: 0 };
          return {
            r: parseInt(match[0]) / 255,
            g: parseInt(match[1]) / 255,
            b: parseInt(match[2]) / 255
          };
        }
        if (colorString.startsWith("#")) {
          const hex = colorString.replace("#", "");
          const bigint = parseInt(hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex, 16);
          return {
            r: (bigint >> 16 & 255) / 255,
            g: (bigint >> 8 & 255) / 255,
            b: (bigint & 255) / 255
          };
        }
        return { r: 1, g: 1, b: 1 };
      };
    }
  });

  // src/helpers/border.js
  var applyBorders, applyIndividualBorders;
  var init_border = __esm({
    "src/helpers/border.js"() {
      "use strict";
      init_color();
      applyBorders = (node, computedStyles) => {
        var _a, _b, _c, _d;
        if (!computedStyles)
          return;
        const borderWidth = parseFloat(computedStyles.borderWidth) || 0;
        const borderColor = computedStyles.borderColor ? hexToFigmaColor(computedStyles.borderColor) : { r: 0, g: 0, b: 0 };
        const hasBorders = borderWidth > 0;
        if (hasBorders) {
          node.strokes = [{
            type: "SOLID",
            color: borderColor
          }];
          node.strokeWeight = borderWidth;
          return;
        }
        const borderTop = parseFloat((_a = computedStyles.borderTop) == null ? void 0 : _a.split(" ")[0]) || 0;
        const borderRight = parseFloat((_b = computedStyles.borderRight) == null ? void 0 : _b.split(" ")[0]) || 0;
        const borderBottom = parseFloat((_c = computedStyles.borderBottom) == null ? void 0 : _c.split(" ")[0]) || 0;
        const borderLeft = parseFloat((_d = computedStyles.borderLeft) == null ? void 0 : _d.split(" ")[0]) || 0;
        if (borderTop || borderRight || borderBottom || borderLeft) {
          applyIndividualBorders(node, {
            top: borderTop,
            right: borderRight,
            bottom: borderBottom,
            left: borderLeft
          }, borderColor);
        }
      };
      applyIndividualBorders = (node, borders, color) => {
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
        lines.forEach((line) => {
          line.locked = true;
          node.appendChild(line);
        });
      };
    }
  });

  // src/helpers/text.js
  function loadFont(family, style) {
    return __async(this, null, function* () {
      const key = `${family}-${style}`;
      if (FONT_CACHE.has(key))
        return;
      try {
        yield figma.loadFontAsync({ family, style });
        FONT_CACHE.add(key);
      } catch (e) {
        try {
          yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
        } catch (e2) {
        }
      }
    });
  }
  function parseFontFamily(fontFamily) {
    if (!fontFamily || fontFamily === "none")
      return "Inter";
    return fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  }
  function getFontStyle(fontWeight, fontStyle) {
    const w = parseInt(fontWeight) || 400;
    if (w >= 700)
      return "Bold";
    if (fontStyle === "italic")
      return "Italic";
    return "Regular";
  }
  var FONT_CACHE, createTextEl, getOffsets, convertTextAlign, configureTextWrapping, isElementWithText;
  var init_text = __esm({
    "src/helpers/text.js"() {
      "use strict";
      init_color();
      FONT_CACHE = /* @__PURE__ */ new Set();
      createTextEl = (textFrame, element, parent) => __async(void 0, null, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
        const frameWidth = Math.max(parseFloat((_a = element.bounding_rect) == null ? void 0 : _a.width) || 100, 10);
        const frameHeight = Math.max(parseFloat((_b = element.bounding_rect) == null ? void 0 : _b.height) || 10, 10);
        textFrame.resize(frameWidth, frameHeight);
        const textNode = figma.createText();
        textNode.name = `${element.tag}:text`;
        const family = parseFontFamily((_c = element.computed_styles) == null ? void 0 : _c.fontFamily);
        const style = getFontStyle((_d = element.computed_styles) == null ? void 0 : _d.fontWeight, (_e = element.computed_styles) == null ? void 0 : _e.fontStyle);
        yield loadFont(family, style);
        textNode.fontName = { family, style };
        textNode.characters = element.content || "";
        const fontSize = parseFloat((_f = element.computed_styles) == null ? void 0 : _f.fontSize) || 18;
        textNode.fontSize = Math.max(fontSize, 4);
        const lineHeightVal = parseFloat((_g = element.computed_styles) == null ? void 0 : _g.lineHeight) || fontSize * 1.4;
        textNode.lineHeight = { value: Math.max(lineHeightVal, fontSize), unit: "PIXELS" };
        if ((_h = element.computed_styles) == null ? void 0 : _h.letterSpacing) {
          textNode.letterSpacing = { value: parseFloat(element.computed_styles.letterSpacing), unit: "PIXELS" };
        }
        const textDecoration = ((_i = element.computed_styles) == null ? void 0 : _i.textDecoration) || "none";
        if (textDecoration === "underline")
          textNode.textDecoration = "UNDERLINE";
        if (textDecoration === "line-through")
          textNode.textDecoration = "STRIKETHROUGH";
        textNode.fills = ((_j = element.computed_styles) == null ? void 0 : _j.color) ? [{ type: "SOLID", color: hexToFigmaColor(element.computed_styles.color) }] : [];
        if ((_k = element.computed_styles) == null ? void 0 : _k.textAlign) {
          textNode.textAlignHorizontal = convertTextAlign(element.computed_styles.textAlign);
        }
        if (textNode.width > frameWidth) {
          configureTextWrapping(textNode, frameWidth, element.computed_styles, frameHeight);
        }
        const textAlign = ((_l = element.computed_styles) == null ? void 0 : _l.textAlign) || "start";
        const verticalAlign = ((_m = element.computed_styles) == null ? void 0 : _m.alignItems) || "start";
        [textNode.x, textNode.y] = getOffsets(textNode, frameWidth, frameHeight, textAlign, verticalAlign, element.computed_styles);
        if (element.absolute_position) {
          const parentX = parent.type !== "PAGE" ? parent.absoluteTransform[0][2] : 0;
          const parentY = parent.type !== "PAGE" ? parent.absoluteTransform[1][2] : 0;
          textFrame.x = element.absolute_position.left - parentX;
          textFrame.y = element.absolute_position.top - parentY;
        }
        textFrame.appendChild(textNode);
      });
      getOffsets = (textNode, frameWidth, frameHeight, textAlign, verticalAlign, computedStyles) => {
        var _a, _b;
        const pl = parseFloat(computedStyles == null ? void 0 : computedStyles.paddingLeft) || 0;
        const pr = parseFloat(computedStyles == null ? void 0 : computedStyles.paddingRight) || 0;
        const pt = parseFloat(computedStyles == null ? void 0 : computedStyles.paddingTop) || 0;
        const pb = parseFloat(computedStyles == null ? void 0 : computedStyles.paddingBottom) || 0;
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
          (_a = horizontalAlignMap[textAlign]) != null ? _a : pl,
          (_b = verticalAlignMap[verticalAlign]) != null ? _b : pt
        ];
      };
      convertTextAlign = (textAlign) => {
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
      configureTextWrapping = (textNode, frameWidth, computedStyles, frameHeight) => __async(void 0, null, function* () {
        const textWrap = (computedStyles == null ? void 0 : computedStyles.whiteSpace) !== "nowrap";
        if (textWrap) {
          textNode.textAutoResize = "HEIGHT";
          textNode.resize(frameWidth, textNode.height);
          if (textNode.height > frameHeight && frameHeight > 0) {
            textNode.resize(frameWidth, frameHeight);
            textNode.textAutoResize = "WIDTH_AND_HEIGHT";
            yield figma.loadFontAsync(textNode.fontName);
          }
        } else {
          textNode.textAutoResize = "WIDTH_AND_HEIGHT";
        }
      });
      isElementWithText = (element) => {
        const textContent = (element.content || "").trim();
        return textContent.length > 0 && element.children.length === 0 || element.children.length === 1 && element.children.some((child) => ["svg"].includes(child.tag));
      };
    }
  });

  // src/helpers/position.js
  var positionElement, addPadding;
  var init_position = __esm({
    "src/helpers/position.js"() {
      "use strict";
      positionElement = (element, parent, node) => {
        var _a, _b;
        if (!element.bounding_rect)
          return;
        const { left = 0, top = 0, width = 100, height = 10 } = element.bounding_rect;
        const nodeWidth = Math.max(parseFloat(width) || 100, 5);
        const nodeHeight = Math.max(parseFloat(height) || 10, 5);
        node.resize(nodeWidth, nodeHeight);
        if (parent && parent.type !== "PAGE") {
          const parentTransform = parent.absoluteTransform;
          if (parentTransform) {
            const parentX = ((_a = parentTransform[0]) == null ? void 0 : _a[2]) || 0;
            const parentY = ((_b = parentTransform[1]) == null ? void 0 : _b[2]) || 0;
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
      addPadding = (node, element) => {
        const cs = element.computed_styles || {};
        node.paddingLeft = parseFloat(cs.paddingLeft) || 0;
        node.paddingRight = parseFloat(cs.paddingRight) || 0;
        node.paddingTop = parseFloat(cs.paddingTop) || 0;
        node.paddingBottom = parseFloat(cs.paddingBottom) || 0;
      };
    }
  });

  // src/helpers/create.js
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
  var createFrame;
  var init_create = __esm({
    "src/helpers/create.js"() {
      "use strict";
      init_color();
      createFrame = (node, element) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i;
        node = figma.createFrame();
        node.name = element.tag;
        node.clipsContent = true;
        const bg = (_a = element.computed_styles) == null ? void 0 : _a.backgroundColor;
        const hasBg = bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
        node.fills = hasBg ? [{ type: "SOLID", color: hexToFigmaColor(bg) }] : [];
        node.opacity = parseFloat((_b = element.computed_styles) == null ? void 0 : _b.opacity) || 1;
        const borderRadius = parseFloat((_c = element.computed_styles) == null ? void 0 : _c.borderRadius);
        if (borderRadius > 0) {
          node.cornerRadius = borderRadius;
        }
        const flexDirection = (_d = element.computed_styles) == null ? void 0 : _d.flexDirection;
        if (flexDirection && flexDirection !== "none") {
          const hasFlexChildren = (_e = element.children) == null ? void 0 : _e.some(
            (child) => {
              var _a2, _b2;
              return ((_a2 = child.computed_styles) == null ? void 0 : _a2.display) === "flex" || ((_b2 = child.computed_styles) == null ? void 0 : _b2.display) === "inline-flex";
            }
          );
          if (!hasFlexChildren) {
            node.layoutMode = flexDirection === "column" ? "VERTICAL" : "HORIZONTAL";
            node.counterAxisSizingMode = "AUTO";
            node.primaryAxisSizingMode = "AUTO";
            if ((_f = element.computed_styles) == null ? void 0 : _f.justifyContent) {
              node.primaryAxisAlignItems = convertJustifyContent(element.computed_styles.justifyContent);
            }
            if ((_g = element.computed_styles) == null ? void 0 : _g.alignItems) {
              node.counterAxisAlignItems = convertAlignItems(element.computed_styles.alignItems);
            }
            if ((_h = element.computed_styles) == null ? void 0 : _h.gap) {
              const gap = parseFloat(element.computed_styles.gap);
              if (gap > 0) {
                node.itemSpacing = gap;
              }
            } else if ((_i = element.computed_styles) == null ? void 0 : _i.rowGap) {
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
    }
  });

  // src/helpers/images.js
  var createImageElement, fetchImageData;
  var init_images = __esm({
    "src/helpers/images.js"() {
      "use strict";
      createImageElement = (node, element) => __async(void 0, null, function* () {
        var _a, _b;
        const src = ((_a = element.attributes) == null ? void 0 : _a.src) || ((_b = element.computed_styles) == null ? void 0 : _b.backgroundImage);
        if (!src || src === "none")
          return null;
        try {
          let imageUrl = src;
          if (imageUrl.startsWith("url(")) {
            imageUrl = imageUrl.slice(4, -1).replace(/['"]/g, "");
          }
          if (imageUrl.startsWith("data:")) {
            const image2 = figma.createImage(yield fetchImageData(imageUrl));
            const fill2 = { type: "IMAGE", imageHash: image2.hash, scaleMode: "FILL" };
            node.fills = [fill2];
            return image2;
          }
          const response = yield fetch(imageUrl);
          if (!response.ok)
            return null;
          const blob = yield response.blob();
          const arrayBuffer = yield blob.arrayBuffer();
          const image = figma.createImage(new Uint8Array(arrayBuffer));
          const fill = { type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" };
          node.fills = [fill];
          return image;
        } catch (e) {
          return null;
        }
      });
      fetchImageData = (dataUrl) => __async(void 0, null, function* () {
        const base64 = dataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      });
    }
  });

  // src/core/createFigmaStructure.js
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
  var BLOCK_TAGS, TEXT_TAGS, MEDIA_TAGS, createFigmaStructure;
  var init_createFigmaStructure = __esm({
    "src/core/createFigmaStructure.js"() {
      "use strict";
      init_border();
      init_text();
      init_position();
      init_create();
      init_images();
      BLOCK_TAGS = /* @__PURE__ */ new Set(["nav", "div", "section", "main", "ul", "a", "li", "header", "footer", "article", "aside", "ol", "form", "figure", "details", "summary"]);
      TEXT_TAGS = /* @__PURE__ */ new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a", "button", "i", "b", "strong", "em", "label", "figcaption", "cite", "q", "code", "pre"]);
      MEDIA_TAGS = /* @__PURE__ */ new Set(["img", "svg", "picture", "video", "canvas"]);
      createFigmaStructure = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (jsonData, parent = figma.currentPage, depth = 0, GP = { computed_styles: { display: "null" } }) {
        var _a, _b, _c, _d, _e;
        if (!Array.isArray(jsonData)) {
          console.error("Expected an array of JSON data.");
          return;
        }
        if (jsonData.length > 1) {
          jsonData.sort((a, b) => {
            var _a2, _b2;
            const aZ = ((_a2 = a.computed_styles) == null ? void 0 : _a2.zIndex) || 0;
            const bZ = ((_b2 = b.computed_styles) == null ? void 0 : _b2.zIndex) || 0;
            return aZ - bZ;
          });
        }
        for (const element of jsonData) {
          if (((_a = element.computed_styles) == null ? void 0 : _a.display) === "none")
            continue;
          let node;
          const hasDirectText = isElementWithText(element);
          const isBlock = BLOCK_TAGS.has(element.tag);
          const isText = TEXT_TAGS.has(element.tag) || hasDirectText;
          const isMedia = MEDIA_TAGS.has(element.tag);
          if (element.tag === "body" || isBlock && !hasDirectText) {
            node = createFrame(node, element);
            node.layoutMode = "NONE";
            node.clipsContent = true;
            node.name = element.tag;
          } else if (isText) {
            if (parent.type === "TEXT")
              continue;
            const textFrame = createFrame(node, element);
            textFrame.name = `${element.tag}:wrapper`;
            textFrame.layoutMode = "NONE";
            yield createTextEl(textFrame, element, parent);
            if (parent.type !== "TEXT") {
              parent.appendChild(textFrame);
            }
            node = textFrame;
          } else if (isMedia) {
            if (element.tag === "img") {
              const imgFrame = figma.createRectangle();
              imgFrame.name = "img";
              const w = Math.max(parseFloat((_b = element.bounding_rect) == null ? void 0 : _b.width) || 100, 10);
              const h = Math.max(parseFloat((_c = element.bounding_rect) == null ? void 0 : _c.height) || 10, 10);
              imgFrame.resize(w, h);
              const imageCreated = yield createImageElement(imgFrame, element);
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
          if (((_d = element.computed_styles) == null ? void 0 : _d.borderRadius) && !isMedia) {
            node.cornerRadius = parseFloat(element.computed_styles.borderRadius) || 0;
          }
          if (((_e = element.computed_styles) == null ? void 0 : _e.boxShadow) && element.computed_styles.boxShadow !== "none") {
            try {
              node.effects = [parseBoxShadow(element.computed_styles.boxShadow)];
            } catch (e) {
            }
          }
          if (element.children && Array.isArray(element.children) && element.children.length > 0) {
            yield createFigmaStructure(element.children, node, depth + 1, element);
          }
        }
      });
    }
  });

  // src/code.ts
  var require_code = __commonJS({
    "src/code.ts"(exports) {
      init_createFigmaStructure();
      figma.ui.onmessage = (msg) => __async(exports, null, function* () {
        if (msg.type === "import-json") {
          figma.notify("Importing JSON...", { timeout: 2e3 });
          try {
            yield createFigmaStructure(msg.data);
            figma.notify("JSON Imported Successfully!", { timeout: 2e3 });
            figma.ui.postMessage({ type: "import-success" });
          } catch (err) {
            const error = err;
            figma.notify(`Error: ${error.message}`, { timeout: 4e3 });
            console.error(error);
            figma.ui.postMessage({ type: "import-error", error: error.message });
          }
        }
      });
      figma.showUI(__html__, { width: 360, height: 420 });
    }
  });
  require_code();
})();

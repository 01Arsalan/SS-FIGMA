export const hexToFigmaColor = (colorString) => {
  if (!colorString) return { r: 1, g: 1, b: 1 };

  if (colorString.startsWith("rgba")) {
    const match = colorString.match(/[\d.]+/g);
    if (!match || match.length < 3) return { r: 0, g: 0, b: 0 };
    return {
      r: parseFloat(match[0]) / 255,
      g: parseFloat(match[1]) / 255,
      b: parseFloat(match[2]) / 255,
    };
  }

  if (colorString.startsWith("rgb")) {
    const match = colorString.match(/\d+/g);
    if (!match) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(match[0]) / 255,
      g: parseInt(match[1]) / 255,
      b: parseInt(match[2]) / 255,
    };
  }

  if (colorString.startsWith("#")) {
    const hex = colorString.replace("#", "");
    const bigint = parseInt(hex.length === 3
      ? hex.split("").map(c => c + c).join("")
      : hex, 16);
    return {
      r: ((bigint >> 16) & 255) / 255,
      g: ((bigint >> 8) & 255) / 255,
      b: (bigint & 255) / 255,
    };
  }

  return { r: 1, g: 1, b: 1 };
};

export const extractAlpha = (colorString) => {
  if (!colorString) return 1;

  if (colorString.startsWith("rgba")) {
    const match = colorString.match(/[\d.]+/g);
    if (match && match.length >= 4) {
      return parseFloat(match[3]);
    }
  }
  return 1;
};

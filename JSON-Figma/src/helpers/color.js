export const hexToFigmaColor = (colorString) => {
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
        const bigint = parseInt(hex, 16);
        return {
            r: ((bigint >> 16) & 255) / 255,
            g: ((bigint >> 8) & 255) / 255,
            b: (bigint & 255) / 255,
        };
    }
    return { r: 1, g: 1, b: 1 };
}
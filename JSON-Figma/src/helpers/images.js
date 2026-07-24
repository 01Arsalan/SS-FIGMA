export const createImageElement = async (node, element) => {
  const src = element.attributes?.src || element.computed_styles?.backgroundImage;

  if (!src || src === 'none') return null;

  try {
    let imageUrl = src;

    if (imageUrl.startsWith('url(')) {
      imageUrl = imageUrl.slice(4, -1).replace(/['"]/g, '');
    }

    if (imageUrl.startsWith('data:')) {
      const image = figma.createImage(await fetchImageData(imageUrl));
      const fill = { type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' };
      node.fills = [fill];
      return image;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const image = figma.createImage(new Uint8Array(arrayBuffer));
    const fill = { type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' };

    node.fills = [fill];
    return image;

  } catch {
    return null;
  }
};

const fetchImageData = async (dataUrl) => {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const hasImage = (element) => {
  const src = element.attributes?.src;
  const bgImage = element.computed_styles?.backgroundImage;
  return !!(src || (bgImage && bgImage !== 'none'));
};

export const extractImageUrl = (element) => {
  const src = element.attributes?.src;
  if (src) return src;

  const bgImage = element.computed_styles?.backgroundImage;
  if (bgImage && bgImage !== 'none') {
    return bgImage.slice(4, -1).replace(/['"]/g, '');
  }

  return null;
};

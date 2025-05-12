import { createFigmaStructure } from "./core/createFigmaStructure.js";

figma.ui.onmessage = async (msg) => {
  if (msg.type === "import-json") {
      figma.notify("Importing JSON...", { timeout: 2000 });
      try {
          await createFigmaStructure(msg.data);
          figma.notify("JSON Imported Successfully!", { timeout: 2000 });
      } catch (err: unknown) {
          const error = err as Error;
          figma.notify(`Error: ${error.message}`, { timeout: 4000 });
          console.error(error);
      }
  }
  figma.closePlugin();
};

figma.showUI(__html__, { width: 300, height: 200 });

<div align="center">

# 🎨 Screenshot → Figma

**A three-stage pipeline that converts web pages and screenshots into pixel-perfect Figma components via structured JSON.**

[![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-9C27B0?logo=figma)](https://www.figma.com/plugin-docs/)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Selenium](https://img.shields.io/badge/Selenium-Extraction-43B02A?logo=selenium)](https://www.selenium.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Plugin-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📋 Overview

**Screenshot → Figma** is a full-stack pipeline that bridges the gap between visual design assets and Figma's component model. Starting from a webpage URL, an HTML file, or a raw screenshot, it extracts every DOM element with its computed styles and spatial hierarchy, serializes everything into a structured JSON document, and then reconstructs the layout inside Figma as native frames, text nodes, images, and auto-layout containers.

The core extraction engine uses **Selenium** to render pages in a real browser (ensuring JavaScript-rendered content is captured) and walks the live DOM tree collecting 40+ computed CSS properties per element—position, size, colors, typography, spacing, borders, shadows, flexbox, and background images. The **Figma plugin** then reads this JSON and maps each element to its Figma counterpart, handling font loading, image fetching, border decomposition, box-shadow conversion, and auto-layout mapping.

This is **not** a screenshot-to-code tool that guesses the layout. It is a **structural extraction and reconstruction** system that preserves the exact hierarchy, positioning, and styling of the original page.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INPUT LAYER                                     │
│                                                                          │
│   Webpage URL ────┐                                                     │
│   HTML File   ────┤──→ Selenium renders & walks DOM ─→ Raw Element Tree │
│   Screenshot  ────┘      (with Claude AI fallback)                      │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTRACTION ENGINE (Python / Selenium)              │
│                                                                          │
│   For each DOM node:                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ • getBoundingClientRect()     → pixel-perfect position & size   │   │
│   │ • offsetLeft / offsetTop      → absolute document coordinates   │   │
│   │ • window.getComputedStyle()   → 40+ CSS properties (full map)   │   │
│   │ • direct text content         → no child text duplication        │   │
│   │ • visibility check            → filter hidden/zero-size nodes   │   │
│   │ • infinite scroll handling    → scroll-triggered lazy loading   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   Output: Structured JSON with nested child array preserving DOM tree    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FIGMA PLUGIN (TypeScript / Figma API)              │
│                                                                          │
│   JSON ──→ Recursive element processor ──→ Native Figma nodes           │
│                                                                          │
│   Frame Creation:                                                        │
│   • figma.createFrame()   → auto-layout (NONE / VERTICAL / HORIZONTAL)  │
│   • figma.createText()    → dynamic font loading from extracted family  │
│   • figma.createRectangle → image fills from <img> + background-image   │
│   • figma.createRectangle → individual side borders as child rects      │
│                                                                          │
│   Style Mapping:                                                         │
│   • Colors:  hex, rgb, rgba → Figma RGB ({r, g, b} in 0..1 range)       │
│   • Borders: uniform via strokes, individual via geometric rectangles    │
│   • Shadows: CSS box-shadow → Figma DROP_SHADOW effects                 │
│   • Layout:  flexDirection, justifyContent, alignItems → auto-layout    │
│   • Spacing: padding/margin mapped per side, gap → itemSpacing          │
│   • Text:    fontSize, lineHeight, letterSpacing, textAlign, decoration │
│   • Z-index: manual sort for correct stacking order                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Stages

| Stage | Technology | Purpose |
|-------|-----------|---------|
| **1. Page Rendering** | Selenium + ChromeDriver | Renders JS-heavy pages, detects lazy-loaded content via scroll simulation |
| **2. DOM Extraction** | Custom Python engine | Recursive walk collecting bounding rects, computed styles, attributes, and clean text |
| **3. JSON Serialization** | FastAPI REST API | Serves extraction results with CORS, file upload, and download endpoints |
| **4. Figma Reconstruction** | Figma Plugin (TypeScript) | Recursive node creation with full style and layout mapping |

---

## 🧩 Components

### 1. Backend API (`backend/`)

[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Selenium](https://img.shields.io/badge/Selenium-4.25-43B02A?logo=selenium)](https://www.selenium.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)

A FastAPI server exposing three extraction endpoints. The engine uses Selenium's ChromeDriver to render web pages, recursively walks the live DOM, and computes exact coordinates and CSS property maps for every visible element.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/extract-url` | Extract JSON from a webpage URL |
| `POST` | `/extract-html` | Upload and extract from an HTML file |
| `POST` | `/extract-screenshot` | Convert screenshot → HTML (via Claude AI) → extract JSON |
| `GET` | `/download/{filename}` | Download previously generated JSON |

**Key Features:**
- Auto-resolves ChromeDriver path (environment variable, system PATH, common locations)
- Scroll simulation for lazy-loaded content detection
- Visibility filtering (display:none, visibility:hidden, opacity:0, zero dimensions)
- Direct text extraction (avoids child text duplication)
- 40+ computed CSS properties captured per element

### 2. Web Frontend (`frontend/`)

[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A dark-themed single-page application built with Tailwind CSS. No framework dependencies—just clean HTML, CSS, and vanilla JavaScript. Served directly by the FastAPI backend.

**Features:**
- Three input modes (URL, HTML upload, Screenshot upload)
- Real-time JSON preview with syntax highlighting
- One-click download and clipboard copy
- Animated progress indicators during extraction
- Graceful error recovery

### 3. Figma Plugin (`JSON-Figma/`)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![esbuild](https://img.shields.io/badge/esbuild-0.19-FFCF00?logo=esbuild)](https://esbuild.github.io/)
[![Figma API](https://img.shields.io/badge/Figma_API-1.0.0-9C27B0?logo=figma)](https://www.figma.com/plugin-docs/api/api-overview/)

A Figma plugin that imports JSON extraction results into the active page as native Figma nodes. Built with TypeScript and bundled with esbuild.

**Element Mapping:**

| JSON Tag | Figma Node | Notes |
|----------|-----------|-------|
| `div`, `section`, `nav`, `main`, `header`, `footer`, `article`, `aside` | `Frame` | Auto-layout based on `flexDirection` |
| `h1`–`h6`, `p`, `span`, `a`, `button`, `label` | `Frame` + `Text` child | Dynamic font loading from extracted `fontFamily` |
| `img` | `Rectangle` with image fill | Fetches remote images via Figma API |
| Elements with `background-image` | `Frame` with image fill | Extracts URL from CSS `url()` |
| Elements with individual borders | `Frame` + child `Rectangle`s | Each side rendered as a separate shape |
| Elements with `box-shadow` | `Frame` with `DROP_SHADOW` effect | Parses offset, radius, spread, color |

**Plugin UI Features:**
- Drag-and-drop JSON file import
- Clipboard paste (with keyboard shortcut detection)
- Animated progress bar during import
- Success/error state feedback
- Dark theme matching Figma's design language

### 4. Screenshot AI Pipeline (`backend/screenshot_to_html.py`)

For screenshot input, the pipeline first converts the image to HTML using **Claude 3.5 Sonnet** (Anthropic API), then runs the standard extraction on the generated HTML. The AI prompt enforces pixel-perfect replication with exact colors, fonts, spacing, and all UI elements.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Chrome** browser installed
- **ChromeDriver** ([download](https://chromedriver.chromium.org/)) matching your Chrome version
- **Node.js 18+** (for the Figma plugin)
- **Anthropic API key** (optional, only for screenshot input)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd screenshot-to-figma

# 2. Set up the Python backend
cd backend
pip install -r requirements.txt

# 3. Set ChromeDriver path (optional, auto-detected if in PATH)
export CHROMEDRIVER_PATH="/path/to/chromedriver"

# 4. Start the API server
python api.py
# → Server running at http://localhost:8000

# 5. In another terminal, set up the Figma plugin
cd JSON-Figma
npm install
npm run build
```

### Usage

#### Web Interface
Open **http://localhost:8000** in your browser. Choose an input method, submit, and download the JSON.

#### Figma Plugin
1. Open Figma → Plugins → Development → Import plugin from manifest
2. Select `JSON-Figma/manifest.json`
3. Right-click on canvas → Plugins → SS → Figma Importer
4. Load the JSON file you downloaded

#### API Direct (cURL)
```bash
curl -X POST http://localhost:8000/extract-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

curl -X POST http://localhost:8000/extract-html \
  -F "file=@page.html"

curl -X POST http://localhost:8000/extract-screenshot \
  -F "file=@screenshot.png" \
  -F "api_key=sk-ant-..."
```

---

## 📦 JSON Schema

Each extracted element follows this structure:

```json
{
  "tag": "div",
  "attributes": { "class": "container", "id": "main" },
  "bounding_rect": {
    "left": 0, "top": 0, "width": 1440, "height": 900,
    "right": 1440, "bottom": 900
  },
  "absolute_position": { "left": 0, "top": 0 },
  "computed_styles": {
    "display": "flex",
    "flexDirection": "row",
    "backgroundColor": "#ffffff",
    "color": "#333333",
    "fontSize": "16px",
    "fontFamily": "\"Inter\", sans-serif",
    "fontWeight": "400",
    "paddingLeft": "24px",
    "borderRadius": "8px",
    "boxShadow": "0 2px 8px rgba(0,0,0,0.1)"
  },
  "content": "Direct text only (no child text)",
  "children": []
}
```

---

## 🛠 Technical Highlights

- **Structural preservation**: Maintains the exact DOM hierarchy in the JSON, enabling accurate reconstruction in Figma
- **Computed style extraction**: Captures 40+ CSS properties via `window.getComputedStyle()`, not just inline styles
- **Direct text isolation**: Extracts only the text nodes directly under each element, avoiding child text duplication
- **Dynamic font loading**: Reads the extracted `fontFamily`, maps weight to Bold/Regular, and loads fonts dynamically via Figma's `loadFontAsync`
- **Auto-layout mapping**: Detects `flexDirection` and maps it to Figma's layout mode with proper alignment conversion
- **Border decomposition**: Renders individual side borders as separate rectangle children when uniform `border` shorthand isn't used
- **Scroll simulation**: Detects lazy-loaded content by scrolling incrementally and observing DOM position changes
- **Image fetching**: For `<img>` tags and CSS `background-image`, fetches the remote resource and creates native image fills

---

## 📁 Project Structure

```
.
├── backend/
│   ├── api.py                  # FastAPI server (3 extraction endpoints)
│   ├── extractor.py            # Selenium-based DOM extraction engine
│   ├── screenshot_to_html.py   # Claude AI integration for SS→HTML
│   └── requirements.txt        # Python dependencies
├── frontend/
│   └── index.html              # Single-page web UI (Tailwind CSS)
├── JSON-Figma/
│   ├── manifest.json            # Figma plugin manifest
│   ├── ui.html                  # Plugin UI (drag-drop, clipboard, progress)
│   ├── src/
│   │   ├── code.ts              # Plugin entry point
│   │   ├── core/
│   │   │   └── createFigmaStructure.js  # Recursive node creation engine
│   │   └── helpers/
│   │       ├── border.js        # Uniform & individual side borders
│   │       ├── color.js         # hex/rgb/rgba → Figma color
│   │       ├── create.js        # Frame creation with auto-layout
│   │       ├── images.js        # Remote image fetch & fill
│   │       ├── position.js      # Absolute positioning with parent offset
│   │       └── text.js          # Text node with dynamic fonts & wrapping
│   ├── dist/
│   │   └── code.js              # Compiled plugin output
│   └── package.json
├── outputs/                     # Generated JSON files (gitignored)
├── .gitignore
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <sub>Built with ❤️ for designers and developers who believe in pixel perfection.</sub>
</div>

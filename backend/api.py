import os
import json
import tempfile
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

from extractor import extract_html_data, save_as_json
from screenshot_to_html import generate_html_from_screenshot, image_to_base64

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SS → Figma Converter API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")


class URLRequest(BaseModel):
    url: str
    headless: bool = True


@app.get("/api")
async def api_info() -> dict:
    """Return API metadata and available endpoints."""
    return {
        "service": "SS → Figma Converter",
        "version": "2.0.0",
        "endpoints": {
            "POST /extract-url": "Extract JSON from a webpage URL",
            "POST /extract-html": "Extract JSON from an uploaded HTML file",
            "POST /extract-screenshot": "Convert screenshot to HTML, then extract JSON",
            "GET /download/{filename}": "Download a generated JSON file",
        },
    }


@app.post("/extract-url")
async def extract_from_url(request: URLRequest) -> JSONResponse:
    """Extract structured JSON from a webpage URL."""
    temp_output = os.path.join(OUTPUT_DIR, "temp_output.json")
    try:
        data = extract_html_data(source=request.url, headless=request.headless)
        save_as_json(data, temp_output)
        return JSONResponse(content={
            "success": True,
            "data": data,
            "element_count": _count_elements(data),
            "download_url": "/download/temp_output.json",
        })
    except Exception as e:
        logger.exception("URL extraction failed")
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@app.post("/extract-html")
async def extract_from_html(file: UploadFile = File(...), headless: bool = Form(True)) -> JSONResponse:
    """Extract structured JSON from an uploaded HTML file."""
    if not file.filename or not file.filename.endswith((".html", ".htm")):
        raise HTTPException(status_code=400, detail="Please upload an HTML file (.html or .htm)")

    temp_html = os.path.join(tempfile.gettempdir(), file.filename)
    base_name = os.path.splitext(file.filename)[0]
    temp_output = os.path.join(OUTPUT_DIR, f"{base_name}.json")

    try:
        content = await file.read()
        with open(temp_html, "wb") as f:
            f.write(content)

        data = extract_html_data(source=temp_html, headless=headless)
        save_as_json(data, temp_output)

        return JSONResponse(content={
            "success": True,
            "data": data,
            "element_count": _count_elements(data),
            "download_url": f"/download/{os.path.basename(temp_output)}",
        })
    except Exception as e:
        logger.exception("HTML extraction failed")
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
    finally:
        if os.path.exists(temp_html):
            os.remove(temp_html)


@app.post("/extract-screenshot")
async def extract_from_screenshot(
    file: UploadFile = File(...),
    api_key: Optional[str] = Form(None),
    headless: bool = Form(True),
) -> JSONResponse:
    """Convert a screenshot to HTML via AI, then extract structured JSON."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file (PNG, JPG)")

    api_key_to_use = api_key or ANTHROPIC_API_KEY
    if not api_key_to_use:
        raise HTTPException(status_code=400, detail="Anthropic API key is required for screenshot processing")

    temp_image = os.path.join(tempfile.gettempdir(), file.filename)
    base_name = os.path.splitext(file.filename)[0]
    temp_html = os.path.join(tempfile.gettempdir(), f"{base_name}.html")
    temp_output = os.path.join(OUTPUT_DIR, f"{base_name}.json")

    try:
        content = await file.read()
        with open(temp_image, "wb") as f:
            f.write(content)

        base64_image = image_to_base64(temp_image)
        html_content = generate_html_from_screenshot(api_key_to_use, base64_image)

        with open(temp_html, "w", encoding="utf-8") as f:
            f.write(html_content)

        data = extract_html_data(source=temp_html, headless=headless)
        save_as_json(data, temp_output)

        return JSONResponse(content={
            "success": True,
            "data": data,
            "element_count": _count_elements(data),
            "download_url": f"/download/{os.path.basename(temp_output)}",
            "generated_html": html_content,
        })
    except Exception as e:
        logger.exception("Screenshot extraction failed")
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
    finally:
        for f_path in [temp_image, temp_html]:
            if os.path.exists(f_path):
                os.remove(f_path)


@app.get("/download/{filename}")
async def download_json(filename: str) -> FileResponse:
    """Download a previously generated JSON file."""
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="application/json", filename=filename)


def _count_elements(data) -> int:
    """Recursively count all elements in the extracted tree."""
    count = 0
    if isinstance(data, list):
        for item in data:
            count += 1
            count += _count_elements(item.get("children", []))
    elif isinstance(data, dict):
        count += 1
        count += _count_elements(data.get("children", []))
    return count


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

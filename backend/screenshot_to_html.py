import base64
import os
import logging

from anthropic import Anthropic

logger = logging.getLogger(__name__)

GENERATION_SYSTEM_PROMPT = """
You have perfect vision and pay great attention to detail which makes you an expert at building single page apps using Tailwind, HTML and JS.
You take screenshots of a reference web page from the user, and then build single page apps using Tailwind, HTML and JS.

Rules:
- Make the app look exactly like the screenshot
- Include every single UI element
- Match background color, text color, font size, font family, padding, margin, border
- Use exact text from the screenshot
- Ensure layout matches the screenshot precisely
- Use placeholder images from https://placehold.co with descriptive alt text

Libraries to use:
- Tailwind: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts allowed
- Font Awesome: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">

Return ONLY the full code within <html></html> tags.
"""


def image_to_base64(image_path: str) -> str:
    """Read an image file and return its base64-encoded string."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file {image_path} not found")

    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def generate_html_from_screenshot(api_key: str, base64_image: str) -> str:
    """Use Claude AI to generate HTML that visually matches the provided screenshot."""
    client = Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=4096,
        system=GENERATION_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": base64_image,
                        },
                    },
                    {
                        "type": "text",
                        "text": "Generate code for a web page that looks exactly like this.",
                    },
                ],
            }
        ],
    )

    html = message.content[0].text

    if "```html" in html:
        html = html.split("```html")[1].split("```")[0].strip()
    elif "```" in html:
        html = html.split("```")[1].split("```")[0].strip()

    return html


def save_html(html_content: str, output_path: str) -> None:
    """Write HTML content to a file."""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    logger.info("HTML saved to %s", output_path)

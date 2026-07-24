import json
import os
import time
import shutil
import logging
from typing import Optional

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.remote.webdriver import WebDriver

logger = logging.getLogger(__name__)

IGNORED_TAGS = {"script", "style", "noscript", "link", "meta", "br", "hr", "wbr"}


def resolve_chromedriver() -> str:
    """Locate the ChromeDriver binary via env var, PATH, or common paths."""
    env_path = os.environ.get("CHROMEDRIVER_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    which_path = shutil.which("chromedriver")
    if which_path:
        return which_path

    common_paths = [
        "/opt/homebrew/bin/chromedriver",
        "/usr/local/bin/chromedriver",
        "/usr/bin/chromedriver",
        "/snap/bin/chromedriver",
        os.path.expanduser("~/chromedriver"),
    ]
    for p in common_paths:
        if os.path.exists(p):
            return p

    return "chromedriver"


def get_bounding_rect(driver: WebDriver, element: WebElement) -> dict:
    """Get the element's bounding client rect via JS."""
    return driver.execute_script("""
        const rect = arguments[0].getBoundingClientRect();
        return {
            left: rect.left, top: rect.top,
            width: rect.width, height: rect.height,
            right: rect.right, bottom: rect.bottom
        };
    """, element)


def get_absolute_position(driver: WebDriver, element: WebElement) -> dict:
    """Compute absolute document position by walking offsetParent chain."""
    return driver.execute_script("""
        let elem = arguments[0];
        let x = 0, y = 0;
        while (elem) {
            x += elem.offsetLeft;
            y += elem.offsetTop;
            elem = elem.offsetParent;
        }
        return { left: x, top: y };
    """, element)


def get_computed_styles(driver: WebDriver, element: WebElement) -> dict:
    """Extract 40+ computed CSS properties via window.getComputedStyle."""
    return driver.execute_script("""
        const s = window.getComputedStyle(arguments[0]);
        return {
            position: s.position,
            display: s.display,
            visibility: s.visibility,
            overflow: s.overflow,
            opacity: s.opacity,
            marginTop: s.marginTop,
            marginBottom: s.marginBottom,
            marginLeft: s.marginLeft,
            marginRight: s.marginRight,
            paddingTop: s.paddingTop,
            paddingRight: s.paddingRight,
            paddingBottom: s.paddingBottom,
            paddingLeft: s.paddingLeft,
            width: s.width,
            height: s.height,
            left: s.left,
            top: s.top,
            right: s.right,
            bottom: s.bottom,
            flexDirection: s.flexDirection,
            backgroundColor: s.backgroundColor === 'transparent' || s.backgroundColor === 'rgba(0, 0, 0, 0)' ? null : s.backgroundColor,
            color: s.color,
            fontSize: s.fontSize,
            fontFamily: s.fontFamily,
            fontWeight: s.fontWeight,
            fontStyle: s.fontStyle,
            lineHeight: s.lineHeight,
            textAlign: s.textAlign,
            textDecoration: s.textDecoration,
            letterSpacing: s.letterSpacing,
            wordSpacing: s.wordSpacing,
            whiteSpace: s.whiteSpace,
            zIndex: s.zIndex ? parseInt(s.zIndex, 10) : 0,
            borderRadius: s.borderRadius,
            border: s.border,
            borderTop: s.borderTop,
            borderLeft: s.borderLeft,
            borderRight: s.borderRight,
            borderBottom: s.borderBottom,
            borderColor: s.borderColor,
            borderWidth: s.borderWidth,
            borderStyle: s.borderStyle,
            boxShadow: s.boxShadow,
            justifyContent: s.justifyContent,
            alignItems: s.alignItems,
            alignSelf: s.alignSelf,
            flexGrow: s.flexGrow,
            flexShrink: s.flexShrink,
            flexBasis: s.flexBasis,
            gap: s.gap,
            rowGap: s.rowGap,
            columnGap: s.columnGap,
            backgroundImage: s.backgroundImage,
            backgroundSize: s.backgroundSize,
            backgroundPosition: s.backgroundPosition,
            backgroundRepeat: s.backgroundRepeat,
            backgroundAttachment: s.backgroundAttachment,
            transform: s.transform
        };
    """, element)


def get_element_attributes(driver: WebDriver, element: WebElement) -> dict:
    """Serialize all HTML attributes of an element to a dict."""
    return driver.execute_script("""
        const attrs = arguments[0].attributes;
        const result = {};
        for (let i = 0; i < attrs.length; i++) {
            result[attrs[i].name] = attrs[i].value;
        }
        return result;
    """, element)


def get_direct_text(driver: WebDriver, element: WebElement) -> str:
    """Extract only direct text nodes (skip child element text)."""
    return driver.execute_script("""
        return Array.from(arguments[0].childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join(' ');
    """, element)


def is_element_visible(element_data: dict) -> bool:
    """Check if an element is visible (not hidden, zero-size, or transparent)."""
    cs = element_data["computed_styles"]
    br = element_data["bounding_rect"]

    if cs.get("display") == "none":
        return False
    if cs.get("visibility") == "hidden":
        return False
    if cs.get("opacity") and float(cs["opacity"]) == 0:
        return False

    w = float(br.get("width", 0))
    h = float(br.get("height", 0))
    if w == 0 and h == 0:
        return False

    return True


def get_element_info(driver: WebDriver, element: WebElement) -> dict:
    """Collect all structured data for a single DOM element."""
    return {
        "tag": element.tag_name,
        "attributes": get_element_attributes(driver, element),
        "bounding_rect": get_bounding_rect(driver, element),
        "absolute_position": get_absolute_position(driver, element),
        "computed_styles": get_computed_styles(driver, element),
        "content": get_direct_text(driver, element).strip(),
        "children": [],
    }


def extract_html_data(
    source: str,
    chromedriver_path: Optional[str] = None,
    window_size: tuple = (1440, 900),
    headless: bool = True,
) -> list:
    """
    Render a URL or HTML file in Chrome and extract structured element data.

    Args:
        source: URL or local HTML file path.
        chromedriver_path: Optional explicit path to ChromeDriver.
        window_size: Browser viewport dimensions.
        headless: Run in headless mode.

    Returns:
        List of element dicts with tag, attributes, bounding rect, styles, and children.
    """
    if chromedriver_path is None:
        chromedriver_path = resolve_chromedriver()

    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument(f"--window-size={window_size[0]},{window_size[1]}")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--hide-scrollbars")

    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service, options=options)

    try:
        if os.path.exists(source):
            driver.get(f"file://{os.path.abspath(source)}")
        else:
            driver.get(source)

        time.sleep(3)

        last_top = driver.execute_script("return document.body.getBoundingClientRect().top")
        max_attempts = 5
        attempts = 0
        scroll_step = 500

        while attempts < max_attempts:
            driver.execute_script(f"window.scrollBy(0, {scroll_step});")
            time.sleep(0.8)
            new_top = driver.execute_script("return document.body.getBoundingClientRect().top")
            if new_top == last_top:
                attempts += 1
            else:
                attempts = 0
                last_top = new_top

        time.sleep(1)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(0.5)

        if driver.execute_script("return document.images.length > 0"):
            time.sleep(1)

        body = driver.find_element(By.TAG_NAME, "body")

        def process_element(element: WebElement) -> Optional[dict]:
            element_data = get_element_info(driver, element)
            if element_data["tag"] in IGNORED_TAGS:
                return None

            for child in element.find_elements(By.XPATH, "./*"):
                child_data = process_element(child)
                if child_data:
                    element_data["children"].append(child_data)

            if not is_element_visible(element_data) and not element_data["children"]:
                return None

            return element_data

        body_data = process_element(body)
        return [body_data] if body_data else []

    finally:
        driver.quit()


def save_as_json(data: dict, file_path: str) -> None:
    """Serialize data to a JSON file."""
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info("Data saved to %s", file_path)

# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.options import Options
# import json
# import os
# import time

# # Change this to the path of your local HTML file
# LOCAL_HTML_FILE = "//Users/arsh/Desktop/HTML_FIGMA/example.html"

# def get_absolute_position(driver, element):
#     """
#     Calculate the absolute position of an element relative to the document.
#     """
#     return driver.execute_script("""
#         let elem = arguments[0];
#         let x = 0, y = 0;
#         while (elem) {
#             x += elem.offsetLeft;
#             y += elem.offsetTop;
#             elem = elem.offsetParent;
#         }
#         return { left: x, top: y };
#     """, element)

# def get_element_data(driver, element):
#     """
#     Extract computed styles and accurate positioning data for an element.
#     """
#     bounding_rect = driver.execute_script("""
#         const rect = arguments[0].getBoundingClientRect();
#         return {
#             left: rect.left,
#             top: rect.top,
#             width: rect.width,
#             height: rect.height,
#             right: rect.right,
#             bottom: rect.bottom
#         };
#     """, element)

#     absolute_position = get_absolute_position(driver, element)

#     computed_styles = driver.execute_script("""
#     const styles = window.getComputedStyle(arguments[0]);
#     return {
#         position: styles.position,
#         marginTop: styles.marginTop,
#         marginBottom: styles.marginBottom,
#         marginLeft: styles.marginLeft,
#         marginRight: styles.marginRight,
#         paddingTop: styles.paddingTop,
#         paddingRight: styles.paddingRight,
#         paddingBottom: styles.paddingBottom,
#         paddingLeft: styles.paddingLeft,
#         width: styles.width,
#         height: styles.height,
#         left: styles.left,
#         top: styles.top,
#         right: styles.right,
#         bottom: styles.bottom,
#         display: styles.display,
#         flexDirection: styles.flexDirection,
#         layoutMode: styles.layoutMode,
#         backgroundColor: styles.backgroundColor === 'transparent' ? null : styles.backgroundColor,
#         color: styles.color,
#         fontSize: styles.fontSize,
#         fontFamily: styles.fontFamily,
#         fontWeight: styles.fontWeight,
#         lineHeight: styles.lineHeight,
#         textAlign: styles.textAlign,
#         zIndex: styles.zIndex ? parseInt(styles.zIndex, 10) : 0,
#         opacity: styles.opacity,
#         border: styles.border,
#         borderTop: styles.borderTop,
#         borderLeft: styles.borderLeft,
#         borderRight: styles.borderRight,
#         borderBottom: styles.borderBottom,
#         borderRadius: styles.borderRadius,
#         backgroundImage: styles.backgroundImage,
#         backgroundPosition: styles.backgroundPosition,
#         backgroundSize: styles.backgroundSize,
#         backgroundAttachment: styles.backgroundAttachment,
#         borderColor: styles.borderColor,
#         borderWidth: styles.borderWidth,
#         borderStyle: styles.borderStyle,
#         boxShadow: styles.boxShadow,
#         justifyContent: styles.justifyContent,
#         alignItems: styles.alignItems,
#         alignSelf: styles.alignSelf,
#         flexGrow: styles.flexGrow,
#         textDecoration: styles.textDecoration,
#         whiteSpace:styles.whiteSpace,
#         letterSpacing: styles.letterSpacing,
#         backgroundRepeat: styles.backgroundRepeat
#     };
# """, element)


#     tag_name = element.tag_name
#     attributes = driver.execute_script("""
#         const attrs = arguments[0].attributes;
#         const result = {};
#         for (let i = 0; i < attrs.length; i++) {
#             result[attrs[i].name] = attrs[i].value;
#         }
#         return result;
#     """, element)

#     return {
#         "tag": tag_name,
#         "attributes": attributes,
#         "bounding_rect": bounding_rect,
#         "absolute_position": absolute_position,
#         "computed_styles": computed_styles,
#         "content": element.text.strip()
#     }

# def extract_html_data(source):
#     """
#     Extract hierarchical data from a rendered HTML file or URL.
#     """
#     options = Options()
#     # options.add_argument('--headless')  # Run in headless mode
#     options.add_argument('--window-size=1440,900')
#     options.add_argument('--no-sandbox')
#     options.add_argument('--disable-dev-shm-usage')

#     service = Service('/opt/homebrew/bin/chromedriver')
#     driver = webdriver.Chrome(service=service, options=options)

#     # Determine if source is a file or URL
#     if os.path.exists(source):
#         file_url = f"file://{os.path.abspath(source)}"
#         driver.get(file_url)
#     else:
#         driver.get(source)  # Assume it's a URL

#     time.sleep(3)  # Wait for initial page load

#     # Initial position of body
#     last_top = driver.execute_script("return document.body.getBoundingClientRect().top")
#     max_attempts = 5  # Stop after 5 attempts if position doesn't change
#     attempts = 0
#     scroll_step = 300  # Number of pixels per scroll step

#     while attempts < max_attempts:
#         driver.execute_script(f"window.scrollBy(0, {scroll_step});")
#         time.sleep(1)  # Allow content to load



#         new_top = driver.execute_script("return document.body.getBoundingClientRect().top")

#         print("New top", new_top)
#         print("last top", last_top)
#         if new_top == last_top:
#             attempts += 1  # Increment attempt count if no change
#         else:
#             attempts = 0  # Reset attempts if new content loads
#             last_top = new_top  # Update position

#     time.sleep(2)  # Final wait to ensure everything is loaded
#     print("last top:", last_top)

#     body = driver.find_element(By.TAG_NAME, 'body')

#     def process_element(element):
#         element_data = get_element_data(driver, element)

#         print("Processing element:", element)

#         # Check if the element is visible on the UI
#         computed_styles = element_data["computed_styles"]
#         if (
#             computed_styles.get("display", "") == "none" or
#             computed_styles.get("visibility", "") == "hidden" or
#             computed_styles.get("opacity", "1") == "0" or
#             computed_styles.get("width", "1px") == "0px" or
#             computed_styles.get("height", "1px") == "0px"
#         ):
#             return None  # Skip hidden elements

#         children = element.find_elements(By.XPATH, './*')
#         visible_children = [child_data for child_data in (process_element(child) for child in children) if child_data]

#         element_data['children'] = visible_children
#         return element_data


#     # Process body itself and include it in the data array
#     body_data = process_element(body)
#     driver.quit()

#     return [body_data] if body_data else []


# def save_as_json(data, file_name):
#     """
#     Save the extracted data as JSON.
#     """
#     with open(file_name, 'w', encoding='utf-8') as file:
#         json.dump(data, file, indent=4, ensure_ascii=False)
#     print(f"Data saved to {file_name}")

# # Main script
# if __name__ == "__main__":
#     output_file = "Page_5.json"
#     data = extract_html_data(LOCAL_HTML_FILE)
#     save_as_json(data, output_file)






















from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import json
import os
import time

def get_absolute_position(driver, element):
    """
    Calculate the absolute position of an element relative to the document.
    """
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

def get_element_data(driver, element):
    """
    Extract computed styles and accurate positioning data for an element.
    """
    bounding_rect = driver.execute_script("""
        const rect = arguments[0].getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom
        };
    """, element)

    absolute_position = get_absolute_position(driver, element)

    computed_styles = driver.execute_script("""
    const styles = window.getComputedStyle(arguments[0]);
    return {
        position: styles.position,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        width: styles.width,
        height: styles.height,
        left: styles.left,
        top: styles.top,
        right: styles.right,
        bottom: styles.bottom,
        display: styles.display,
        flexDirection: styles.flexDirection,
        layoutMode: styles.layoutMode,
        backgroundColor: styles.backgroundColor === 'transparent' ? null : styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        textAlign: styles.textAlign,
        zIndex: styles.zIndex ? parseInt(styles.zIndex, 10) : 0,
        opacity: styles.opacity,
        border: styles.border,
        borderTop: styles.borderTop,
        borderLeft: styles.borderLeft,
        borderRight: styles.borderRight,
        borderBottom: styles.borderBottom,
        borderRadius: styles.borderRadius,
        backgroundImage: styles.backgroundImage,
        backgroundPosition: styles.backgroundPosition,
        backgroundSize: styles.backgroundSize,
        backgroundAttachment: styles.backgroundAttachment,
        borderColor: styles.borderColor,
        borderWidth: styles.borderWidth,
        borderStyle: styles.borderStyle,
        boxShadow: styles.boxShadow,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        alignSelf: styles.alignSelf,
        flexGrow: styles.flexGrow,
        textDecoration: styles.textDecoration,
        whiteSpace:styles.whiteSpace,
        letterSpacing: styles.letterSpacing,
        backgroundRepeat: styles.backgroundRepeat
    };
    """, element)

    tag_name = element.tag_name
    attributes = driver.execute_script("""
        const attrs = arguments[0].attributes;
        const result = {};
        for (let i = 0; i < attrs.length; i++) {
            result[attrs[i].name] = attrs[i].value;
        }
        return result;
    """, element)

    return {
        "tag": tag_name,
        "attributes": attributes,
        "bounding_rect": bounding_rect,
        "absolute_position": absolute_position,
        "computed_styles": computed_styles, 
        "content": " ".join(element.text.split())   
    }

import os
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def extract_html_data(source):
    """
    Extract hierarchical data from a rendered HTML file or URL.
    """
    options = Options()
    # options.add_argument('--headless')  # Run in headless mode
    options.add_argument('--window-size=1440,900')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    service = Service('/opt/homebrew/bin/chromedriver')
    driver = webdriver.Chrome(service=service, options=options)

    # Determine if source is a file or URL
    if os.path.exists(source):
        file_url = f"file://{os.path.abspath(source)}"
        driver.get(file_url)
    else:
        driver.get(source)  # Assume it's a URL

    time.sleep(3)  # Wait for initial page load

    # Initial position of body
    last_top = driver.execute_script("return document.body.getBoundingClientRect().top")
    max_attempts = 5  # Stop after 5 attempts if position doesn't change
    attempts = 0
    scroll_step = 300  # Number of pixels per scroll step

    while attempts < max_attempts:
        driver.execute_script(f"window.scrollBy(0, {scroll_step});")
        time.sleep(1)  # Allow content to load



        new_top = driver.execute_script("return document.body.getBoundingClientRect().top")

        print("New top", new_top)
        print("last top", last_top)
        if new_top == last_top:
            attempts += 1  # Increment attempt count if no change
        else:
            attempts = 0  # Reset attempts if new content loads
            last_top = new_top  # Update position

    time.sleep(2)  # Final wait to ensure everything is loaded
    print("last top:", last_top)

    body = driver.find_element(By.TAG_NAME, 'body')

    def process_element(element):
        element_data = get_element_data(driver, element)

        print("Processing element:", element)

        # Check if the element is visible on the UI
        computed_styles = element_data["computed_styles"]
        if (
            computed_styles.get("display", "") == "none" or
            computed_styles.get("visibility", "") == "hidden" or
            computed_styles.get("opacity", "1") == "0" or
            computed_styles.get("width", "1px") == "0px" or
            computed_styles.get("height", "1px") == "0px"
        ):
            return None  # Skip hidden elements

        children = element.find_elements(By.XPATH, './*')
        visible_children = [child_data for child_data in (process_element(child) for child in children) if child_data]

        element_data['children'] = visible_children
        return element_data


    # Process body itself and include it in the data array
    body_data = process_element(body)
    driver.quit()

    return [body_data] if body_data else []

def save_as_json(data, file_name):
    """
    Save the extracted data as JSON.
    """
    with open(file_name, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)
    print(f"Data saved to {file_name}")

# Main script
if __name__ == "__main__":
    source = "https://thrive-cycling.com/products/cliq?variant=42208088883315"  # Replace with a file path or a URL
    output_file = "Page_3.json"
    
    data = extract_html_data(source)
    save_as_json(data, output_file)
























# no text duplication

# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.options import Options
# import json
# import os
# import time

# def get_absolute_position(driver, element):
#     """
#     Calculate the absolute position of an element relative to the document.
#     """
#     return driver.execute_script("""
#         let elem = arguments[0];
#         let x = 0, y = 0;
#         while (elem) {
#             x += elem.offsetLeft;
#             y += elem.offsetTop;
#             elem = elem.offsetParent;
#         }
#         return { left: x, top: y };
#     """, element)

# def get_element_data(driver, element):
#     """
#     Extract computed styles and accurate positioning data for an element.
#     """
#     bounding_rect = driver.execute_script("""
#         const rect = arguments[0].getBoundingClientRect();
#         return {
#             left: rect.left,
#             top: rect.top,
#             width: rect.width,
#             height: rect.height,
#             right: rect.right,
#             bottom: rect.bottom
#         };
#     """, element)

#     absolute_position = get_absolute_position(driver, element)

#     computed_styles = driver.execute_script("""
#     const styles = window.getComputedStyle(arguments[0]);
#     return {
#         position: styles.position,
#         marginTop: styles.marginTop,
#         marginBottom: styles.marginBottom,
#         marginLeft: styles.marginLeft,
#         marginRight: styles.marginRight,
#         paddingTop: styles.paddingTop,
#         paddingRight: styles.paddingRight,
#         paddingBottom: styles.paddingBottom,
#         paddingLeft: styles.paddingLeft,
#         width: styles.width,
#         height: styles.height,
#         left: styles.left,
#         top: styles.top,
#         right: styles.right,
#         bottom: styles.bottom,
#         display: styles.display,
#         flexDirection: styles.flexDirection,
#         layoutMode: styles.layoutMode,
#         backgroundColor: styles.backgroundColor === 'transparent' ? null : styles.backgroundColor,
#         color: styles.color,
#         fontSize: styles.fontSize,
#         fontFamily: styles.fontFamily,
#         fontWeight: styles.fontWeight,
#         lineHeight: styles.lineHeight,
#         textAlign: styles.textAlign,
#         zIndex: styles.zIndex ? parseInt(styles.zIndex, 10) : 0,
#         opacity: styles.opacity,
#         border: styles.border,
#         borderTop: styles.borderTop,
#         borderLeft: styles.borderLeft,
#         borderRight: styles.borderRight,
#         borderBottom: styles.borderBottom,
#         borderRadius: styles.borderRadius,
#         backgroundImage: styles.backgroundImage,
#         backgroundPosition: styles.backgroundPosition,
#         backgroundSize: styles.backgroundSize,
#         backgroundAttachment: styles.backgroundAttachment,
#         borderColor: styles.borderColor,
#         borderWidth: styles.borderWidth,
#         borderStyle: styles.borderStyle,
#         boxShadow: styles.boxShadow,
#         justifyContent: styles.justifyContent,
#         alignItems: styles.alignItems,
#         alignSelf: styles.alignSelf,
#         flexGrow: styles.flexGrow,
#         textDecoration: styles.textDecoration,
#         whiteSpace:styles.whiteSpace,
#         letterSpacing: styles.letterSpacing,
#         backgroundRepeat: styles.backgroundRepeat
#     };
#     """, element)

#     tag_name = element.tag_name
#     attributes = driver.execute_script("""
#         const attrs = arguments[0].attributes;
#         const result = {};
#         for (let i = 0; i < attrs.length; i++) {
#             result[attrs[i].name] = attrs[i].value;
#         }
#         return result;
#     """, element)

#     return {
#         "tag": tag_name,
#         "attributes": attributes,
#         "bounding_rect": bounding_rect,
#         "absolute_position": absolute_position,
#         "computed_styles": computed_styles, 
#         "content": " ".join(element.text.split())   
#     }


# def get_direct_text(driver, element):
#     """
#     Return the text nodes directly under the given element (ignoring text from child elements).
#     """
#     return driver.execute_script("""
#         return Array.from(arguments[0].childNodes)
#             .filter(node => node.nodeType === Node.TEXT_NODE)
#             .map(node => node.textContent.trim())
#             .join(' ');
#     """, element)

# def extract_html_data(source):
#     """
#     Extract hierarchical data from a rendered HTML file or URL.
#     """
#     options = Options()
#     # options.add_argument('--headless')  # Run in headless mode
#     options.add_argument('--window-size=1440,900')
#     options.add_argument('--no-sandbox')
#     options.add_argument('--disable-dev-shm-usage')

#     service = Service('/opt/homebrew/bin/chromedriver')
#     driver = webdriver.Chrome(service=service, options=options)

#     # Determine if source is a file or URL
#     if os.path.exists(source):
#         file_url = f"file://{os.path.abspath(source)}"
#         driver.get(file_url)
#     else:
#         driver.get(source)  # Assume it's a URL

#     time.sleep(3)  # Wait for initial page load

#     # Initial position of body
#     last_top = driver.execute_script("return document.body.getBoundingClientRect().top")
#     max_attempts = 5  # Stop after 5 attempts if position doesn't change
#     attempts = 0
#     scroll_step = 300  # Number of pixels per scroll step

#     while attempts < max_attempts:
#         driver.execute_script(f"window.scrollBy(0, {scroll_step});")
#         time.sleep(1)  # Allow content to load



#         new_top = driver.execute_script("return document.body.getBoundingClientRect().top")

#         print("New top", new_top)
#         print("last top", last_top)
#         if new_top == last_top:
#             attempts += 1  # Increment attempt count if no change
#         else:
#             attempts = 0  # Reset attempts if new content loads
#             last_top = new_top  # Update position

#     time.sleep(2)  # Final wait to ensure everything is loaded
#     print("last top:", last_top)

#     body = driver.find_element(By.TAG_NAME, 'body')

#     def process_element(element):
#         # Get full element data as a dictionary
#         element_data = get_element_data(driver, element)
#         # Override the "content" field with only the direct text
#         element_data['content'] = get_direct_text(driver, element)

#         # Check if the element is visible on the UI
#         computed_styles = element_data["computed_styles"]
#         if (
#             computed_styles.get("display", "") == "none" or
#             computed_styles.get("visibility", "") == "hidden" or
#             computed_styles.get("opacity", "1") == "0" or
#             computed_styles.get("width", "1px") == "0px" or
#             computed_styles.get("height", "1px") == "0px"
#         ):
#             return None  # Skip hidden elements

#         children = element.find_elements(By.XPATH, './*')
#         visible_children = [process_element(child) for child in children if process_element(child)]

#         element_data['children'] = visible_children
#         return element_data

#     # Process body itself and include it in the data array
#     body_data = process_element(body)
#     driver.quit()

#     return [body_data] if body_data else []

# def save_as_json(data, file_name):
#     """
#     Save the extracted data as JSON.
#     """
#     with open(file_name, 'w', encoding='utf-8') as file:
#         json.dump(data, file, indent=4, ensure_ascii=False)
#     print(f"Data saved to {file_name}")

# # Main script
# if __name__ == "__main__":
#     source = "http://buildweb-woad.vercel.app"  # Replace with a file path or a URL
#     output_file = "numi.json"
    
#     data = extract_html_data(source)
#     save_as_json(data, output_file)

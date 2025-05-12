# import base64
# import os
# import google.generativeai as genai

# def generate_screenshot_html(api_key, base64_screenshot):
#     genai.configure(api_key=api_key)
#     model = genai.GenerativeModel('gemini-pro-vision')

#     try:
#         response = model.generate_content([
#             "You have perfect vision and pay great attention to detail which makes you an expert at building single page apps using Tailwind, HTML and JS.\n"
#             "You take screenshots of a reference web page from the user, and then build single page apps using Tailwind, HTML and JS.\n\n"
#             "Rules:\n"
#             "- Make the app look exactly like the screenshot\n"
#             "- Include every single UI element\n"
#             "- Match background color, text color, font size, font family, padding, margin, border\n"
#             "- Use exact text from the screenshot\n"
#             "- Ensure layout matches the screenshot precisely\n"
#             "- Use placeholder images from https://placehold.co with descriptive alt text\n\n"
#             "Libraries to use:\n"
#             "- Tailwind: <script src=\"https://cdn.tailwindcss.com\"></script>\n"
#             "- Google Fonts allowed\n"
#             "- Font Awesome: <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css\">\n\n"
#             "Return ONLY the full code within <html></html> tags.",
#             {
#                 "mime_type": "image/png",
#                 "data": base64_screenshot
#             }
#         ])
        
#         webpage_html = response.text
#     except Exception as e:
#         print(f"Error analyzing screenshot: {e}")
#         webpage_html = "<html><body>Error generating webpage</body></html>"
    
#     return webpage_html

# def save_html(html_content, output_filename='screenshot_page.html'):
#     """
#     Save HTML content to a file.
    
#     :param html_content: HTML string to save
#     :param output_filename: Name of the output HTML file
#     """
#     with open(output_filename, 'w', encoding='utf-8') as f:
#         f.write(html_content)
#     print(f"HTML file saved as {output_filename}")

# def image_to_base64(filename):
#     """
#     Convert an image file to base64 encoded string.
    
#     :param filename: Name of the image file in the current directory
#     :return: Base64 encoded string of the image
#     """
#     try:
#         if not os.path.exists(filename):
#             raise FileNotFoundError(f"Image file {filename} not found in current directory")
        
#         with open(filename, 'rb') as image_file:
#             image_binary = image_file.read()
#             base64_encoded = base64.b64encode(image_binary)

#             return base64_encoded.decode('utf-8')
    
#     except Exception as e:
#         print(f"Error converting image to base64: {e}")
#         return None

# if __name__ == "__main__":
#     import os
#     API_KEY = 'AIzaSyDS6QE5_4EsjbCjwIXoQS0JAdgYRwN2-fI'
    
#     BASE64_SCREENSHOT = image_to_base64('SS_R.png')
    
#     if BASE64_SCREENSHOT:
#         html_output = generate_screenshot_html(API_KEY, BASE64_SCREENSHOT)
        
#         save_html(html_output)
#     else:
#         print("Failed to convert image to base64")






import base64
import os
from anthropic import Anthropic

def generate_screenshot_html(api_key, base64_screenshot):
    client = Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=4096,
            system="""
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
            """,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": base64_screenshot
                            }
                        },
                        {
                            "type": "text", 
                            "text": "Generate code for a web page that looks exactly like this."
                        }
                    ]
                }
            ]
        )
        
        webpage_html = message.content[0].text
    except Exception as e:
        print(f"Error analyzing screenshot: {e}")
        webpage_html = "<html><body>Error generating webpage</body></html>"
    
    return webpage_html

def save_html(html_content, output_filename='screenshot_page.html'):
    """
    Save HTML content to a file.
    
    :param html_content: HTML string to save
    :param output_filename: Name of the output HTML file
    """
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"HTML file saved as {output_filename}")

def image_to_base64(filename):
    """
    Convert an image file to base64 encoded string.
    
    :param filename: Name of the image file in the current directory
    :return: Base64 encoded string of the image
    """
    try:
        if not os.path.exists(filename):
            raise FileNotFoundError(f"Image file {filename} not found in current directory")
        
        with open(filename, 'rb') as image_file:
            image_binary = image_file.read()
            base64_encoded = base64.b64encode(image_binary)

            return base64_encoded.decode('utf-8')
    
    except Exception as e:
        print(f"Error converting image to base64: {e}")
        return None

if __name__ == "__main__":
    import os
    API_KEY = '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'
    
    BASE64_SCREENSHOT = image_to_base64('/Users/arsh/Desktop/SS_HTML/SS_html_prototype/SS_R.png')
    
    if BASE64_SCREENSHOT:
        html_output = generate_screenshot_html(API_KEY, BASE64_SCREENSHOT)
        
        save_html(html_output)
    else:
        print("Failed to convert image to base64")








# /Library/Frameworks/Python.framework/Versions/3.11/bin/python3 -u "/Users/arsh/Desktop/SS_HTML/SS_html_prototype/SS-html_prototype.py"
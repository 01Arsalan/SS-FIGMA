import { applyBorders } from '../helpers/border.js'
import { isElementWithText, createTextEl } from "../helpers/text.js"
import { positionElement, addPadding } from '../helpers/position.js'
import { createFrame } from '../helpers/create.js'

export const createFigmaStructure = async (jsonData, parent = figma.currentPage, depth = 0, GP = { computed_styles: { display: 'null' } }) => {
    if (!Array.isArray(jsonData)) {
        console.error("Expected an array of JSON data.");
        return;
    }

    if (jsonData.length > 1){
        jsonData.sort((a, b) => {
            const aZ = a.computed_styles.zIndex || 0;
            const bZ = b.computed_styles.zIndex || 0;
            return aZ - bZ;
        });
    }

    for (const element of jsonData) {

        if (element.computed_styles.display === "none") continue;

        let node;
        let elementWithDirectText = isElementWithText(element)
        let isFrameEl = element.children.some(child => ["nav", "div", "section", "main", "ul", "li"].includes(child.tag));

        if(element.content == "Premium Natural Ingredients Made with rich shea and cocoa butters plus 8 plant oils to deeply moisturize.") console.log(elementWithDirectText, " : ", element)

        if ((["nav", "div", "section", "main", "ul", "a", "li"].includes(element.tag) && !elementWithDirectText) || element.tag == "body" ) {

            node = createFrame(node, element)

            node.layoutMode = "NONE";
            if(element.tag == "div" && element.content == "Frontend Engineer Develop and optimize responsive e-commerce sites on Shopify, enhancing functionality and user experience across multiple projects.") console.log(elementWithDirectText,"See my work_1",element)


        } else if (["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a", "button", "i"].includes(element.tag) || elementWithDirectText) {


            if(element.tag == "div" && element.content == "Frontend Engineer Develop and optimize responsive e-commerce sites on Shopify, enhancing functionality and user experience across multiple projects.") console.log(elementWithDirectText,"See my work_2",element)

            if (parent.type === "TEXT") continue;

            const textFrame = createFrame(node, element)

            // this approach might be useful in checking if a element has text content and is not equal to all the child text contetnt then create a text node.. there is one issue though.. i may have text of chilren hierarchy & we are only checking for direct children. checking deeper might cause excesive overhead. will have to look into it

            // let content = element.children.map(child => child.content).join(" "); 
            // if (element.content !== content) await createTextEl(textFrame, element, parent)

            await createTextEl(textFrame, element, parent)

            // Add the frame to the parent
            if (parent.type !== "TEXT") {
                parent.appendChild(textFrame);
            }

            node = textFrame;
        }

        else {
            continue;
        }

        addPadding(node, element);

        node.clipsContent = true;

        positionElement(element, parent, node);

        applyBorders(node, element.computed_styles)

        if (parent && parent.type !== "TEXT") {
            parent.appendChild(node);
        }

        if (element.children && Array.isArray(element.children) && element.children.length > 0) {
            await createFigmaStructure(element.children, node, depth + 1, element);
        }
    }
}






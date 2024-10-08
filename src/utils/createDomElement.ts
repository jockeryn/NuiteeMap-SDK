export default function createElement(type: string, props: any, ...children: any[]): HTMLElement {
    const element = document.createElement(type);
    Object.assign(element, props);
    children.forEach((child) => element.appendChild(child));
    return element;
}
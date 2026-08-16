
// Functions to check the type of an object
export function isBoolean(value: unknown): value is boolean
{
    return typeof value === "boolean";
}
export function isNumber(value: unknown): value is number
{
    return typeof value === "number";
}
export function isString(value: unknown): value is string
{
    return typeof value === "string";
}
export function isNonNullObject(value: unknown): value is object
{
    return (value !== null) && (typeof value === "object");
}


// Assertions
export function assert(condition: boolean, message?: string): asserts condition
{
    if (!condition)
    {
        throw new Error(`Failed assertion${message ? `: ${message}` : ""}`);
    }
}


// Remove all children nodes from a DOM element
export function removeAllChildren(element: HTMLElement): void
{
    while (element.firstChild)
    {
        element.removeChild(element.firstChild);
    }
}

// Remove all DOM elements sibling after the current one
export function removeAllFollowingSiblings(element: HTMLElement): void
{
    while (element.nextElementSibling)
    {
        element.nextElementSibling.remove();
    }
}

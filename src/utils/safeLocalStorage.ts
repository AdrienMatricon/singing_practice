// Like localStorage.setItem() but cannot throw
export function set(key: string, value: string): void
{
    try
    {
        window.localStorage.setItem(key, value);
    }
    catch
    {
        console.warn(`Could not set value for key "${key}" to local storage`);
    }
}


// Like localStorage.removeItem() but cannot throw
export function remove(key: string): void
{
    try
    {
        window.localStorage.removeItem(key);
    }
    catch
    {
        console.warn(`Could not remove value for key "${key}" from local storage`);
    }
}


// Like localStorage.getItem() but returns undefined instead of throwing
export function get(key: string): string|null|undefined
{
    try
    {
        return window.localStorage.getItem(key);
    }
    catch
    {
        console.warn(`Could not get value for key "${key}" from local storage`);
        return undefined;
    }
}

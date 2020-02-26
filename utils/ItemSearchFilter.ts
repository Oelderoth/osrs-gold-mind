import escapeStringRegexp from "escape-string-regexp";

export default (value: string): (suggestion: string) => boolean => {
    if (!value || value.length == 0) return () => false;

    const escaped = escapeStringRegexp(value).replace(/\s+/g, '.+?');
    const regex = new RegExp(escaped, 'i')

    return (suggestion) => regex.test(suggestion);
}
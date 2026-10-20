// Fix double-escaped newlines/quotes from AI JSON string output
export function normalizeContent(content) {
    if (!content) return "";

    // Remove BOM if present
    if (content.charCodeAt(0) === 0xfeff) {
        content = content.slice(1);
    }

    // Normalize \r\n to \n
    content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Some models use ampersands instead of line breaks throughout JSX/JS output.
    // Treat it as a delimiter only when the output has the clear repeated pattern.
    const ampersandCount = (content.match(/&/g) || []).length;
    if (ampersandCount > 12 && /;\s*&\s*(?:import|const|return)\b/.test(content)) {
        content = content.replace(/&/g, "\n");
    }

    // Repair a common malformed JSX style string into a style object.
    content = content.replace(
        /style=['"]\{\{\s*animationDelay:\s*['"]([^'"]+)['"]\s*\}\}['"]/g,
        'style={{ animationDelay: "$1" }}',
    );
    content = content.replace(
        /style=\{\{\s*animationDelay:\s*['"]([^'"]+)['"]\s*>>/g,
        'style={{ animationDelay: "$1" }}>',
    );

    const realNewlines = (content.match(/\n/g) || []).length;
    const literalBackslashN = (content.match(/\\n/g) || []).length;

    if (literalBackslashN > realNewlines) {
        // Triple-escaped first: \\\\n → \\n (leave as literal), then \\n → \n
        content = content
            .replace(/\\\\n/g, "%%PRESERVED_ESCAPED_N%%")
            .replace(/\\n/g, "\n")
            .replace(/%%PRESERVED_ESCAPED_N%%/g, "\\n")
            .replace(/\\t/g, "\t")
            .replace(/\\r/g, "")
            .replace(/\\\\/g, "\\");
    }

    // Always clean up backslash-escaped quotes (e.g. className=\"relative\") in code.
    // This is safe because "contains escaped quotes" is always invalid syntax in JSX/React.
    content = content.replace(/(\w+)=\\"([^"]*?)\\"/g, '$1="$2"');

    return content;
}

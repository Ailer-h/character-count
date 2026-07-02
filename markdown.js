function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function parseInline(text) {
    text = escapeHtml(text);

    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");
    text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
    text = text.replace(/_(.+?)_/g, "<em>$1</em>");
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    return text;
}

function splitTableRow(line) {
    let trimmed = line.trim();

    if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
    if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);

    return trimmed.split("|").map(cell => cell.trim());
}

function isTableSeparatorRow(line) {
    if (!line.includes("|") && !line.includes("-")) return false;

    const cells = splitTableRow(line);
    return cells.length > 0 && cells.every(cell => /^:?-+:?$/.test(cell));
}

function getColumnAlignment(cell) {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");

    if (left && right) return "center";
    if (right) return "right";
    if (left) return "left";

    return null;
}

export function parseMarkdown(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");

    let html = "";
    let i = 0;

    let inCodeBlock = false;
    let codeBuffer = [];

    let listType = null;
    let listBuffer = [];

    let paragraphBuffer = [];

    function flushParagraph() {
        if (paragraphBuffer.length) {
            html += `<p>${parseInline(paragraphBuffer.join(" "))}</p>`;
            paragraphBuffer = [];
        }
    }

    function flushList() {
        if (listType) {
            html += `<${listType}>${listBuffer.join("")}</${listType}>`;
            listBuffer = [];
            listType = null;
        }
    }

    while (i < lines.length) {
        const line = lines[i];

        if (line.trim().startsWith("```")) {
            flushParagraph();
            flushList();

            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBuffer = [];
            } else {
                inCodeBlock = false;
                html += `<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`;
            }

            i++;
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            i++;
            continue;
        }

        if (line.includes("|") && i + 1 < lines.length && isTableSeparatorRow(lines[i + 1])) {
            flushParagraph();
            flushList();

            const headerCells = splitTableRow(line);
            const aligns = splitTableRow(lines[i + 1]).map(getColumnAlignment);

            let tableHtml = "<table><thead><tr>";
            headerCells.forEach((cell, idx) => {
                const align = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : "";
                tableHtml += `<th${align}>${parseInline(cell)}</th>`;
            });
            tableHtml += "</tr></thead><tbody>";

            i += 2;

            while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
                const rowCells = splitTableRow(lines[i]);

                tableHtml += "<tr>";
                headerCells.forEach((_, idx) => {
                    const align = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : "";
                    tableHtml += `<td${align}>${parseInline(rowCells[idx] || "")}</td>`;
                });
                tableHtml += "</tr>";

                i++;
            }

            tableHtml += "</tbody></table>";
            html += tableHtml;

            continue;
        }

        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
            flushParagraph();
            flushList();

            const level = headerMatch[1].length;
            html += `<h${level}>${parseInline(headerMatch[2])}</h${level}>`;

            i++;
            continue;
        }

        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
            flushParagraph();
            flushList();
            html += "<hr>";
            i++;
            continue;
        }

        const blockquoteMatch = line.match(/^>\s?(.*)$/);
        if (blockquoteMatch) {
            flushParagraph();
            flushList();
            html += `<blockquote>${parseInline(blockquoteMatch[1])}</blockquote>`;
            i++;
            continue;
        }

        const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
        const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);

        if (ulMatch) {
            flushParagraph();
            if (listType && listType !== "ul") flushList();
            listType = "ul";
            listBuffer.push(`<li>${parseInline(ulMatch[1])}</li>`);
            i++;
            continue;
        }

        if (olMatch) {
            flushParagraph();
            if (listType && listType !== "ol") flushList();
            listType = "ol";
            listBuffer.push(`<li>${parseInline(olMatch[1])}</li>`);
            i++;
            continue;
        }

        if (line.trim() === "") {
            flushParagraph();
            flushList();
            i++;
            continue;
        }

        flushList();
        paragraphBuffer.push(line.trim());
        i++;
    }

    flushParagraph();
    flushList();

    if (inCodeBlock) {
        html += `<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`;
    }

    return html;
}

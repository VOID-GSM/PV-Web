import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const pattern =
    /!\[[^\]]*\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)/g;

  const parts = text.split(pattern).filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const image = part.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);

    if (image) {
      return (
        <img
          key={index}
          src={image[2]}
          alt={image[1]}
          loading="lazy"
          className="my-2 max-h-80 max-w-full rounded-lg object-contain"
        />
      );
    }

    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <del key={index}>{part.slice(2, -2)}</del>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.95em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);

    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline underline-offset-2"
        >
          {link[1]}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({
  content,
  className = "",
}: MarkdownPreviewProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  let codeLines: string[] = [];
  let isInsideCodeBlock = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;

    blocks.push(
      <p key={`p-${blocks.length}`} className="mb-3 whitespace-pre-wrap">
        {renderInline(paragraph.join(" "))}
      </p>,
    );

    paragraph = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) return;

    const items = listItems.map((item, index) => (
      <li key={index} className="pl-1">
        {renderInline(item)}
      </li>
    ));

    blocks.push(
      listType === "ul" ? (
        <ul
          key={`ul-${blocks.length}`}
          className="mb-3 list-disc space-y-1 pl-5"
        >
          {items}
        </ul>
      ) : (
        <ol
          key={`ol-${blocks.length}`}
          className="mb-3 list-decimal space-y-1 pl-5"
        >
          {items}
        </ol>
      ),
    );

    listItems = [];
    listType = null;
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();

      if (isInsideCodeBlock) {
        blocks.push(
          <pre
            key={`code-${index}`}
            className="mb-3 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>,
        );

        codeLines = [];
        isInsideCodeBlock = false;
      } else {
        codeLines = [];
        isInsideCodeBlock = true;
      }

      return;
    }

    if (isInsideCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();

      const level = heading[1].length;

      const headingClass =
        level === 1
          ? "mb-3 text-2xl font-bold"
          : level === 2
            ? "mb-3 text-xl font-bold"
            : level === 3
              ? "mb-2 text-lg font-bold"
              : "mb-2 font-bold";

      blocks.push(
        <div key={`h-${index}`} className={headingClass}>
          {renderInline(heading[2])}
        </div>,
      );

      return;
    }

    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      flushParagraph();
      flushList();

      blocks.push(<hr key={`hr-${index}`} className="my-4 border-gray-200" />);

      return;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);

    if (quote) {
      flushParagraph();
      flushList();

      blocks.push(
        <blockquote
          key={`q-${index}`}
          className="mb-3 border-l-2 border-gray-300 pl-3 text-gray-600"
        >
          {renderInline(quote[1])}
        </blockquote>,
      );

      return;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);

    if (unordered || ordered) {
      flushParagraph();

      const nextType = unordered ? "ul" : "ol";

      if (listType && listType !== nextType) {
        flushList();
      }

      listType = nextType;
      listItems.push((unordered || ordered)![1]);

      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  if (isInsideCodeBlock) {
    blocks.push(
      <pre
        key="code-unclosed"
        className="mb-3 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
  }

  return (
    <div className={`break-words text-sm leading-7 text-gray-800 ${className}`}>
      {blocks.length > 0 ? (
        blocks
      ) : (
        <p className="text-gray-300 italic">미리보기할 내용이 없습니다.</p>
      )}
    </div>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { getFile } from "../../api/fileApi";

interface UploadedImageProps {
  fileId: number;
  alt: string;
}

function UploadedImage({ fileId, alt }: UploadedImageProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getFile(fileId)
      .then((file) => {
        if (isMounted) {
          setImageUrl(file.downloadUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  if (hasError) {
    return (
      <span className="text-sm text-gray-400">
        이미지를 불러오지 못했습니다.
      </span>
    );
  }

  if (!imageUrl) {
    return (
      <span className="text-sm text-gray-400">이미지를 불러오는 중...</span>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      className="my-2 max-h-80 max-w-full rounded-lg object-contain"
    />
  );
}

function renderInline(text: string): ReactNode[] {
  const pattern =
    /!\[([^\]]*)\]\((file:\d+|https?:\/\/[^\s)]+)\)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|\*([^*\n]+)\*|_([^_\n]+)_|`([^`\n]+)`/g;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = nodes.length;

    if (match[1] !== undefined) {
      const alt = match[1];
      const imageSource = match[2];

      if (imageSource.startsWith("file:")) {
        const fileId = Number(imageSource.slice(5));

        if (Number.isSafeInteger(fileId) && fileId > 0) {
          nodes.push(<UploadedImage key={key} fileId={fileId} alt={alt} />);
        } else {
          nodes.push(`[${alt}](${imageSource})`);
        }
      } else {
        nodes.push(
          <img
            key={key}
            src={imageSource}
            alt={alt}
            loading="lazy"
            className="my-2 max-h-80 max-w-full rounded-lg object-contain"
          />,
        );
      }
    } else if (match[3] !== undefined) {
      nodes.push(
        <a
          key={key}
          href={match[4]}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline underline-offset-2"
        >
          {match[3]}
        </a>,
      );
    } else if (match[5] !== undefined || match[6] !== undefined) {
      nodes.push(<strong key={key}>{match[5] ?? match[6]}</strong>);
    } else if (match[7] !== undefined) {
      nodes.push(<del key={key}>{match[7]}</del>);
    } else if (match[8] !== undefined || match[9] !== undefined) {
      nodes.push(<em key={key}>{match[8] ?? match[9]}</em>);
    } else if (match[10] !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.95em]"
        >
          {match[10]}
        </code>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
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

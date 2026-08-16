import { Lexer, type Token, type Tokens } from "marked";
import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { findByTitle } from "./text";
import type { Note } from "./types";
import { useVault } from "./store";

type PreviewProps = {
  content: string;
  notes?: Note[];
  onToggleTask?: (index: number) => void;
  className?: string;
};

const WIKI = /\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g;
const TAG = /(^|[\s(])#([A-Za-z][\w-]{0,32})\b/g;

export function MarkdownPreview({ content, notes, onToggleTask, className }: PreviewProps) {
  const tokens = Lexer.lex(content || "", { gfm: true });
  const ctx = { taskIndex: 0 };
  return (
    <div className={cn("markdown-body", className)}>
      {tokens.map((token, i) => (
        <Block key={i} token={token} notes={notes} onToggleTask={onToggleTask} ctx={ctx} />
      ))}
    </div>
  );
}

function Block({
  token,
  notes,
  onToggleTask,
  ctx,
}: {
  token: Token;
  notes?: Note[];
  onToggleTask?: (index: number) => void;
  ctx: { taskIndex: number };
}) {
  switch (token.type) {
    case "space":
      return null;
    case "heading": {
      const Tag = `h${Math.min(token.depth, 4)}` as "h1" | "h2" | "h3" | "h4";
      return (
        <Tag>
          <Inline tokens={token.tokens ?? []} notes={notes} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p>
          <Inline tokens={token.tokens ?? []} notes={notes} />
        </p>
      );
    case "blockquote":
      return <CalloutOrQuote token={token as Tokens.Blockquote} notes={notes} onToggleTask={onToggleTask} ctx={ctx} />;
    case "list":
      return <ListBlock token={token as Tokens.List} notes={notes} onToggleTask={onToggleTask} ctx={ctx} />;
    case "code":
      return (
        <pre>
          <code>{token.text}</code>
        </pre>
      );
    case "hr":
      return <hr />;
    case "table":
      return <TableBlock token={token as Tokens.Table} notes={notes} />;
    case "html":
      return <p>{token.text}</p>;
    default:
      if ("tokens" in token && Array.isArray(token.tokens)) {
        return (
          <p>
            <Inline tokens={token.tokens} notes={notes} />
          </p>
        );
      }
      if ("text" in token && typeof token.text === "string") {
        return <p>{token.text}</p>;
      }
      return null;
  }
}

function CalloutOrQuote({
  token,
  notes,
  onToggleTask,
  ctx,
}: {
  token: Tokens.Blockquote;
  notes?: Note[];
  onToggleTask?: (index: number) => void;
  ctx: { taskIndex: number };
}) {
  const first = token.tokens[0];
  let kind: string | null = null;
  let restTokens = token.tokens;
  if (first && first.type === "paragraph" && first.tokens) {
    const raw = first.raw ?? first.text ?? "";
    const m = raw.match(/^\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i);
    if (m) {
      kind = m[1].toUpperCase();
      const stripped = raw.replace(m[0], "");
      const inner = Lexer.lex(stripped, { gfm: true });
      restTokens = [...inner, ...token.tokens.slice(1)];
    }
  }
  if (kind) {
    return (
      <aside className="callout">
        <div className="callout-label">{kind}</div>
        {restTokens.map((child, i) => (
          <Block key={i} token={child} notes={notes} onToggleTask={onToggleTask} ctx={ctx} />
        ))}
      </aside>
    );
  }
  return (
    <blockquote>
      {token.tokens.map((child, i) => (
        <Block key={i} token={child} notes={notes} onToggleTask={onToggleTask} ctx={ctx} />
      ))}
    </blockquote>
  );
}

function ListBlock({
  token,
  notes,
  onToggleTask,
  ctx,
}: {
  token: Tokens.List;
  notes?: Note[];
  onToggleTask?: (index: number) => void;
  ctx: { taskIndex: number };
}) {
  const Tag = token.ordered ? "ol" : "ul";
  return (
    <Tag start={token.ordered ? token.start || 1 : undefined}>
      {token.items.map((item, i) => {
        const isTask = Boolean(item.task);
        const idx = isTask ? ctx.taskIndex++ : -1;
        return (
          <li key={i} className={isTask ? "task-row" : undefined}>
            {isTask ? (
              <button
                type="button"
                className="relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-ink after:absolute after:size-10"
                aria-checked={item.checked}
                role="checkbox"
                onClick={() => onToggleTask?.(idx)}
              >
                {item.checked ? <Check className="size-4" strokeWidth={2.4} /> : <Square className="size-4" strokeWidth={1.8} />}
              </button>
            ) : null}
            <div className={cn("min-w-0", item.checked && "text-muted line-through decoration-subtle")}>
              <Inline tokens={item.tokens ?? []} notes={notes} />
            </div>
          </li>
        );
      })}
    </Tag>
  );
}

function TableBlock({ token, notes }: { token: Tokens.Table; notes?: Note[] }) {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            {token.header.map((cell, i) => (
              <th key={i}>
                <Inline tokens={cell.tokens} notes={notes} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {token.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>
                  <Inline tokens={cell.tokens} notes={notes} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Inline({ tokens, notes }: { tokens: Token[]; notes?: Note[] }) {
  return (
    <>
      {tokens.map((token, i) => (
        <InlineToken key={i} token={token} notes={notes} />
      ))}
    </>
  );
}

function InlineToken({ token, notes }: { token: Token; notes?: Note[] }) {
  switch (token.type) {
    case "text":
      if ("tokens" in token && token.tokens?.length) {
        return <Inline tokens={token.tokens} notes={notes} />;
      }
      return <RichText text={token.text} notes={notes} />;
    case "strong":
      return (
        <strong>
          <Inline tokens={token.tokens ?? []} notes={notes} />
        </strong>
      );
    case "em":
      return (
        <em>
          <Inline tokens={token.tokens ?? []} notes={notes} />
        </em>
      );
    case "del":
      return (
        <del>
          <Inline tokens={token.tokens ?? []} notes={notes} />
        </del>
      );
    case "codespan":
      return <code>{token.text}</code>;
    case "br":
      return <br />;
    case "link":
      return (
        <a href={token.href} target="_blank" rel="noreferrer">
          <Inline tokens={token.tokens ?? []} notes={notes} />
        </a>
      );
    case "image":
      return <img src={token.href} alt={token.text} className="max-w-full rounded-lg" />;
    case "escape":
      return <>{token.text}</>;
    default:
      if ("tokens" in token && token.tokens) {
        return <Inline tokens={token.tokens} notes={notes} />;
      }
      if ("text" in token) return <RichText text={String(token.text)} notes={notes} />;
      return null;
  }
}

function RichText({ text, notes }: { text: string; notes?: Note[] }) {
  const vaultNotes = useVault((s) => s.notes);
  const catalog = notes ?? vaultNotes;
  const parts: ReactNode[] = [];
  const combined = new RegExp(`${WIKI.source}|${TAG.source}`, "g");
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = combined.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[0].startsWith("[[")) {
      const title = match[1].trim();
      const label = (match[2] || title).trim();
      const found = findByTitle(catalog, title);
      parts.push(
        <WikiLink key={key++} title={title} label={label} exists={Boolean(found)} id={found?.id} />,
      );
    } else {
      const prefix = match[3] ?? "";
      const tag = match[4] ?? "";
      parts.push(
        <span key={key++}>
          {prefix}
          <Link to="/tags" search={{ tag }} className="tag-chip">
            #{tag}
          </Link>
        </span>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function WikiLink({
  title,
  label,
  exists,
  id,
}: {
  title: string;
  label: string;
  exists: boolean;
  id?: string;
}) {
  const navigate = useNavigate();
  const openOrCreate = useVault((s) => s.openOrCreateByTitle);
  return (
    <button
      type="button"
      className={cn("wiki-link", !exists && "wiki-missing")}
      onClick={() => {
        const noteId = id ?? openOrCreate(title);
        void navigate({ to: "/note/$id", params: { id: noteId } });
      }}
    >
      {label}
    </button>
  );
}

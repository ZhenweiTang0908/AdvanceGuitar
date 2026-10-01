import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("/")) return <Link to={href}>{children}</Link>;
            return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

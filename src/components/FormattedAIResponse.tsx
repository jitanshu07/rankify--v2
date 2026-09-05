import React from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface FormattedAIResponseProps {
  content: string;
  onCopy?: () => void;
  isCopied?: boolean;
}

export const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({
  content,
  onCopy,
  isCopied,
}) => {
  // Parse lines and render structured sections
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1 / 2 / 3
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-black text-white mt-4 mb-2 pb-1 border-b border-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {trimmed.replace('## ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-lg font-black text-white mt-5 mb-2.5 text-cyan-300">
            {trimmed.replace('# ', '')}
          </h2>
        );
      }

      // Blockquotes or Traps / Warnings
      if (trimmed.startsWith('> ') || trimmed.includes('Examiner Trap') || trimmed.includes('Trap:')) {
        return (
          <div
            key={idx}
            className="my-2 p-3 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-200 text-xs sm:text-sm font-medium leading-relaxed"
          >
            {trimmed.replace(/^>\s*/, '')}
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-slate-300 pl-1">
            <span className="text-cyan-400 font-bold mt-0.5">•</span>
            <span className="flex-1 leading-relaxed">
              {renderInlineFormatting(bulletText)}
            </span>
          </div>
        );
      }

      // Numbered lists
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 text-xs sm:text-sm text-slate-300 pl-1">
            <span className="text-cyan-400 font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              {numMatch[1]}
            </span>
            <span className="flex-1 leading-relaxed">
              {renderInlineFormatting(numMatch[2])}
            </span>
          </div>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraph
      return (
        <p key={idx} className="my-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  // Inline bold, code/formulas, italic
  const renderInlineFormatting = (text: string) => {
    // Split by code `...` or bold **...**
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeContent = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 font-mono text-[11px] sm:text-xs text-amber-300 font-semibold mx-0.5"
          >
            {codeContent}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldContent = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-white">
            {boldContent}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative group">
      {onCopy && (
        <button
          onClick={onCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition opacity-80 hover:opacity-100 cursor-pointer text-xs flex items-center gap-1"
          title="Copy response"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      )}

      <div className="space-y-0.5 break-words">
        {renderFormattedText(content)}
      </div>
    </div>
  );
};

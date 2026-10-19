// Renders the structured lesson content blocks defined in the Lesson model
// (Section 10): heading, paragraph, code, image, list, table, note, example, summary.
export default function TutorialContent({ blocks = [] }) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="prose-sm max-w-none space-y-4">
      {sorted.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return <h3 key={i} className="font-display text-lg font-semibold text-ink">{block.data.text}</h3>;
          case 'paragraph':
            return <p key={i} className="text-sm text-slate-600 leading-relaxed">{block.data.text}</p>;
          case 'code':
            return (
              <pre key={i} className="bg-ink text-slate-100 rounded-xl p-4 text-xs overflow-x-auto">
                <code>{block.data.code}</code>
              </pre>
            );
          case 'image':
            return <img key={i} src={block.data.url} alt={block.data.alt || ''} className="rounded-xl border border-slate-100" />;
          case 'list':
            return (
              <ul key={i} className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                {block.data.items?.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            );
          case 'table':
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-100 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>{block.data.headers?.map((h, j) => <th key={j} className="text-left px-3 py-2 font-medium text-ink">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {block.data.rows?.map((row, j) => (
                      <tr key={j} className="border-t border-slate-100">
                        {row.map((cell, k) => <td key={k} className="px-3 py-2 text-slate-600">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'note':
            return (
              <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                {block.data.text}
              </div>
            );
          case 'example':
            return (
              <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
                <p className="font-medium mb-1">Example</p>
                {block.data.text}
              </div>
            );
          case 'summary':
            return (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600">
                <p className="font-medium text-ink mb-1">Summary</p>
                {block.data.text}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

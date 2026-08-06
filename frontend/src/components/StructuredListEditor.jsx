import { useState } from 'react';

export default function StructuredListEditor({ label, items, onChange, fields, placeholder }) {
  const emptyDraft = Object.fromEntries(fields.map((f) => [f.key, '']));
  const [draft, setDraft] = useState(emptyDraft);

  function add() {
    if (!draft[fields[0].key]?.trim()) return;
    onChange([...items, { ...draft }]);
    setDraft(emptyDraft);
  }

  function remove(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div style={{ marginTop: 14 }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {fields.map((f, i) => (
          <input
            key={f.key}
            value={draft[f.key]}
            placeholder={f.placeholder}
            style={{ flex: i === 0 ? 2 : 1, minWidth: 100 }}
            onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          />
        ))}
        <button type="button" className="btn-ghost btn" onClick={add}>Add</button>
      </div>

      {items.length === 0 ? (
        <p className="empty-state" style={{ padding: '10px 0' }}>{placeholder}</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          {items.map((item, i) => (
            <div className="list-row" key={i}>
              <span style={{ fontSize: 13.5 }}>
                {item[fields[0].key]}
                {fields[1] && item[fields[1].key] ? ` · ${item[fields[1].key]}` : ''}
              </span>
              <button type="button" className="btn-ghost btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => remove(i)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

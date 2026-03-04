import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const LANGUAGES = [
  { name: 'English', text: 'The quick brown fox jumps over the lazy dog', tokens: 9, flag: 'EN' },
  { name: 'Spanish', text: 'El rápido zorro marrón salta sobre el perro perezoso', tokens: 13, flag: 'ES' },
  { name: 'Chinese', text: '敏捷的棕色狐狸跳过了懒惰的狗', tokens: 14, flag: 'ZH' },
  { name: 'Arabic', text: 'الثعلب البني السريع يقفز فوق الكلب الكسول', tokens: 22, flag: 'AR' },
  { name: 'Hindi', text: 'तेज भूरी लोमड़ी आलसी कुत्ते के ऊपर कूदती है', tokens: 28, flag: 'HI' },
  { name: 'Korean', text: '빠른 갈색 여우가 게으른 개를 뛰어넘다', tokens: 18, flag: 'KO' },
];

export default function MultilingualTokenCost() {
  const [sortBy, setSortBy] = useState<'tokens' | 'name'>('tokens');

  const sorted = [...LANGUAGES].sort((a, b) =>
    sortBy === 'tokens' ? a.tokens - b.tokens : a.name.localeCompare(b.name)
  );

  const maxTokens = Math.max(...LANGUAGES.map(l => l.tokens));

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Multilingual Token Cost
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          The same meaning costs different token counts across languages. English-trained tokenizers create unfair cost disparities.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {(['tokens', 'name'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)} style={{
            padding: '0.3rem 0.6rem', borderRadius: '6px',
            border: `1px solid ${sortBy === s ? '#C76B4A' : '#E5DFD3'}`,
            background: sortBy === s ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: sortBy === s ? '#C76B4A' : '#5A6B5C',
            fontWeight: sortBy === s ? 600 : 400,
            fontSize: '0.72rem', cursor: 'pointer',
          }}>
            Sort by {s === 'tokens' ? 'token count' : 'language'}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem', fontWeight: 600 }}>
          Same sentence across languages (approx. GPT-4 tokenizer)
        </div>
        {sorted.map((lang) => {
          const ratio = lang.tokens / LANGUAGES[0].tokens;
          const barColor = ratio <= 1.2 ? '#8BA888' : ratio <= 2 ? '#D4A843' : '#C76B4A';
          return (
            <div key={lang.name} style={{ display: 'grid', gridTemplateColumns: '55px 1fr 40px', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2C3E2D' }}>
                <span style={{ fontSize: '0.6rem', color: '#7A8B7C', marginRight: '4px' }}>{lang.flag}</span>
                {lang.name}
              </span>
              <div style={{ height: '20px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(lang.tokens / maxTokens) * 100}%`,
                  background: barColor, borderRadius: '3px', transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#7A8B7C', textAlign: 'right' }}>
                {lang.tokens}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#C76B4A08', borderRadius: '8px', border: '1px solid #C76B4A15', fontSize: '0.75rem', color: '#5A6B5C' }}>
        Hindi uses <strong>{(LANGUAGES[4].tokens / LANGUAGES[0].tokens).toFixed(1)}×</strong> more tokens than English for the same meaning — users pay more, get shorter context, and experience slower inference.
      </div>
    </div>
  );
}

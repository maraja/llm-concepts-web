import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: 700 as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  color: '#6E8B6B',
};

interface Memory {
  text: string;
  source: 'conversation' | 'facts' | 'episodic';
  timestamp: string;
  relevance: number;
  retrieved: boolean;
}

const queries = [
  {
    question: 'What was the restaurant I liked in Tokyo?',
    memories: [
      { text: 'User visited Sushi Dai in Tsukiji and gave it 5 stars', source: 'episodic' as const, timestamp: '2 weeks ago', relevance: 0.95, retrieved: true },
      { text: 'User mentioned preferring omakase-style dining', source: 'facts' as const, timestamp: '1 month ago', relevance: 0.72, retrieved: true },
      { text: 'User asked about Tokyo hotel recommendations', source: 'conversation' as const, timestamp: '2 weeks ago', relevance: 0.65, retrieved: true },
      { text: 'User likes Italian food for everyday meals', source: 'facts' as const, timestamp: '3 months ago', relevance: 0.31, retrieved: false },
      { text: 'User discussed Python programming concepts', source: 'conversation' as const, timestamp: '1 week ago', relevance: 0.05, retrieved: false },
      { text: 'User booked flights through ANA airline', source: 'episodic' as const, timestamp: '3 weeks ago', relevance: 0.42, retrieved: false },
    ],
    answer: 'Based on your trip notes, you really enjoyed Sushi Dai in Tsukiji, giving it a 5-star rating. You also mentioned enjoying the omakase-style dining experience there.',
  },
  {
    question: 'Help me plan a similar trip to my last vacation.',
    memories: [
      { text: 'Last trip: 10 days in Japan, visited Tokyo, Kyoto, Osaka', source: 'episodic' as const, timestamp: '2 months ago', relevance: 0.93, retrieved: true },
      { text: 'Budget was $3,200 total including flights', source: 'facts' as const, timestamp: '2 months ago', relevance: 0.88, retrieved: true },
      { text: 'Preferred activities: temple visits, local food, photography', source: 'facts' as const, timestamp: '2 months ago', relevance: 0.85, retrieved: true },
      { text: 'Stayed in ryokans 3 nights, hotels rest of trip', source: 'episodic' as const, timestamp: '2 months ago', relevance: 0.82, retrieved: true },
      { text: 'User mentioned wanting to try South Korea next', source: 'conversation' as const, timestamp: '1 month ago', relevance: 0.68, retrieved: true },
      { text: 'User works remotely on Mondays and Fridays', source: 'facts' as const, timestamp: '5 months ago', relevance: 0.15, retrieved: false },
    ],
    answer: 'Based on your Japan trip, I\'d suggest a similar 10-day trip to South Korea (as you mentioned interest). Budget around $3,200, mixing traditional hanok stays with hotels, focusing on temple visits, local cuisine, and photography opportunities.',
  },
];

const sourceColors: Record<string, { color: string; label: string }> = {
  conversation: { color: '#5B8DB8', label: 'Conversation' },
  facts: { color: '#D4A843', label: 'User Facts' },
  episodic: { color: '#8BA888', label: 'Episodic' },
};

export default function MemoryRetrievalDemo() {
  const [queryIdx, setQueryIdx] = useState(0);
  const [showRetrieved, setShowRetrieved] = useState(false);

  const query = queries[queryIdx];
  const threshold = 0.6;
  const retrieved = query.memories.filter(m => m.relevance >= threshold);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Memory Retrieval Demo
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how an agent queries different memory stores to answer questions. Memories are scored by relevance and retrieved above a threshold.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {queries.map((q, i) => (
          <button key={i} onClick={() => { setQueryIdx(i); setShowRetrieved(false); }} style={{
            padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
            border: `1px solid ${queryIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: queryIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: queryIdx === i ? '#C76B4A' : '#5A6B5C', fontWeight: queryIdx === i ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>{q.question.substring(0, 40)}...</button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#2C3E2D' }}>
        <strong>User:</strong> "{query.question}"
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {Object.entries(sourceColors).map(([key, style]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.color }} />
            <span style={{ color: '#5A6B5C' }}>{style.label}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#B0A898' }}>
          Threshold: {threshold.toFixed(1)}
        </span>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {query.memories.sort((a, b) => b.relevance - a.relevance).map((mem, i) => {
          const style = sourceColors[mem.source];
          const isAbove = mem.relevance >= threshold;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '10px 1fr 80px 130px', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.6rem', marginBottom: '0.25rem', borderRadius: '6px',
              background: isAbove ? style.color + '08' : 'transparent',
              border: `1px solid ${isAbove ? style.color + '22' : '#E5DFD322'}`,
              opacity: isAbove ? 1 : 0.4, transition: 'all 0.3s ease',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.color }} />
              <span style={{ fontSize: '0.78rem', color: '#2C3E2D' }}>{mem.text}</span>
              <span style={{ fontSize: '0.68rem', color: '#B0A898', textAlign: 'right' }}>{mem.timestamp}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ flex: 1, height: '10px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: `${threshold * 100}%`, top: 0, width: '1px', height: '100%', background: '#C76B4A88' }} />
                  <div style={{ height: '100%', width: `${mem.relevance * 100}%`, background: isAbove ? style.color : '#C4BFB3', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: isAbove ? '#2C3E2D' : '#B0A898', fontWeight: isAbove ? 600 : 400, minWidth: '30px', textAlign: 'right' }}>
                  {mem.relevance.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setShowRetrieved(!showRetrieved)} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
          border: '1px solid #8BA888', background: showRetrieved ? 'rgba(139, 168, 136, 0.1)' : 'transparent',
          color: '#8BA888', fontWeight: 600, fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>{showRetrieved ? 'Hide' : 'Show'} Agent Response</button>
        <span style={{ fontSize: '0.78rem', color: '#7A8B7C', display: 'flex', alignItems: 'center' }}>
          {retrieved.length} memories retrieved from {query.memories.length} total
        </span>
      </div>

      {showRetrieved && (
        <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ ...labelStyle, color: '#8BA888', marginBottom: '0.4rem' }}>Agent Response (using retrieved memories)</div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#F5F0E8', margin: 0, lineHeight: 1.7 }}>
            {query.answer}
          </p>
        </div>
      )}
    </div>
  );
}

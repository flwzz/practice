import { useEffect, useState } from 'react';

const SSE = () => {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    const sse = new EventSource('http://localhost:8000/sse');
    sse.onerror = (err) => {
      console.error('An error occurred!!', err);
      // sse.close()
    };
    sse.onmessage = (e) => {
      setText((t) => t + e.data + '\n');
    };

    return () => {
      sse.close();
    };
  }, []);
  return (
    <div>
      <h1>SSE</h1>
      <pre>{text}</pre>
    </div>
  );
};

export default SSE;

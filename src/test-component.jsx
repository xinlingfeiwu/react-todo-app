import React from 'react';

// 简单的测试组件，验证React hooks是否正常工作
export default function TestComponent() {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    console.log('TestComponent mounted successfully - React hooks working!');
  }, []);
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
      <h3>React Hooks Test</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

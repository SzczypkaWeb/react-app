// Placeholder component exposed by this Module Federation remote (name: 'reactApp')
// at './Widget'. Its only job for now is to make it visually obvious that the
// remote loaded and rendered correctly inside a host application.
export function Widget() {
  return (
    <p
      style={{
        padding: '1rem',
        border: '2px dashed #6d28d9',
        borderRadius: '8px',
        backgroundColor: '#ede9fe',
        color: '#4c1d95',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
      }}
    >
      Hello from react-app remote
    </p>
  );
}

export default Widget;

import { Button, Card } from '@szczypkaweb/shared-ui';

/**
 * Widget component exposed by this Module Federation remote (name: 'reactApp')
 * at './Widget'. It demonstrates the integration of shared-ui components
 * (Card and Button) and renders a greeting message with an interactive button.
 */
export function Widget() {
  const handleButtonClick = () => {
    console.log('Button clicked in Widget component');
  };

  return (
    <Card>
      <p
        style={{
          padding: '1rem',
          margin: 0,
          color: '#4c1d95',
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
        }}
      >
        Hello from react-app remote
      </p>
      <div style={{ marginTop: '1rem' }}>
        <Button onClick={handleButtonClick}>Click me</Button>
      </div>
    </Card>
  );
}

export default Widget;

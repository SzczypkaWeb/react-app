import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Widget } from './Widget';

// These tests describe the contract for the placeholder component exposed by this
// Module Federation remote at './Widget'. Per the task spec it must:
//  - render the exact text "Hello from react-app remote"
//  - have some minimal, visible styling so it's obvious it loaded correctly
describe('Widget', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the greeting text', () => {
    render(<Widget />);

    expect(screen.getByText('Hello from react-app remote')).toBeInTheDocument();
  });

  it('applies visible minimal styling to make the loaded remote obvious', () => {
    render(<Widget />);

    const node = screen.getByText('Hello from react-app remote');
    // We don't assert on exact values (colors/px), only that the element carries
    // actual visual styling (not an unstyled bare text node).
    expect(node.getAttribute('style')).toBeTruthy();
    expect(node.style.padding).not.toBe('');
    expect(node.style.border || node.style.backgroundColor).toBeTruthy();
  });

  it('is exported as a named export "Widget" so it matches the exposed module', () => {
    expect(typeof Widget).toBe('function');
  });
});

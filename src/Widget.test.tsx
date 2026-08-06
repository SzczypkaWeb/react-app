import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Widget } from './Widget';

/**
 * Tests describe the contract for the Widget component exposed by this
 * Module Federation remote at './Widget'.
 *
 * Per the task spec, Widget must:
 *  - render the text "Hello from react-app remote" inside a Card from @szczypkaweb/shared-ui
 *  - render a Button below the Card with a basic onClick handler (logs to console)
 *  - integrate the Card and Button from @szczypkaweb/shared-ui
 */
describe('Widget', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the greeting text inside a Card component', () => {
    render(<Widget />);

    expect(screen.getByText('Hello from react-app remote')).toBeInTheDocument();
  });

  it('wraps the greeting text in a Card container with expected styling classes', () => {
    render(<Widget />);

    const bodyDiv = screen.getByText('Hello from react-app remote').closest('div');
    // Text is in the card body; find the parent card element
    const card = bodyDiv?.parentElement?.closest('div');
    // Card component from shared-ui applies the 'suib-card' class to the root
    expect(card).toHaveClass('suib-card');
  });

  it('renders a Button component below the Card', () => {
    render(<Widget />);

    // Button component from shared-ui is a button element
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('Button has the shared-ui styling classes applied', () => {
    render(<Widget />);

    const button = screen.getByRole('button');
    // shared-ui's Button no longer applies a semantic 'suib-button' class —
    // as of its Tailwind v4 migration (feat/button-tailwind-conversion) it
    // applies Tailwind utility classes directly instead, so the Button's
    // dist CSS doesn't need its own stylesheet consumed by this app. Assert
    // on the base classes present regardless of variant/size, rather than
    // the full literal string (which also carries the default variant/size,
    // making the assertion brittle to those defaults changing).
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center', 'rounded', 'cursor-pointer');
  });

  it('Button onClick handler logs to console when clicked', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<Widget />);

    const button = screen.getByRole('button');
    const user = userEvent.setup();

    await user.click(button);

    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('is exported as a named export "Widget" so it matches the exposed module', () => {
    expect(typeof Widget).toBe('function');
  });
});

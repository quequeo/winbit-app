import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders message', () => {
    render(<Toast message="Saved!" onClose={() => {}} />);
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('applies type styles', () => {
    const { rerender, container } = render(
      <Toast message="Ok" type="success" onClose={() => {}} />,
    );
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();

    rerender(<Toast message="Err" type="error" onClose={() => {}} />);
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();

    rerender(<Toast message="Info" type="info" onClose={() => {}} />);
    expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Close me" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto closes after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    try {
      render(<Toast message="Auto" duration={500} onClose={onClose} />);
      vi.advanceTimersByTime(499);
      expect(onClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

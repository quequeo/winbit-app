import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test" message="Message" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when open with info type', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Info" message="Info message" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders success type', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Success" message="Done" type="success" />,
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders error type', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Error" message="Failed" type="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} message="Test" />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Aceptar is clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} message="Test" />);
    fireEvent.click(screen.getByText('Aceptar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

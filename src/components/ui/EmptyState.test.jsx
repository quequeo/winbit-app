import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Inbox } from 'lucide-react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders Lucide icon, title, and description', () => {
    render(<EmptyState icon={Inbox} title="No data" description="There is nothing here yet" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('There is nothing here yet')).toBeInTheDocument();
  });

  it('renders emoji fallback and CTA', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<EmptyState iconEmoji="📭" title="No data" actionLabel="Create" onAction={onAction} />);
    expect(screen.getByText('📭')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders without description', () => {
    render(<EmptyState iconEmoji="📭" title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});

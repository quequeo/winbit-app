import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(<EmptyState icon="📭" title="No data" description="There's nothing here yet" />);
    expect(screen.getByText('📭')).toBeInTheDocument();
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText("There's nothing here yet")).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<EmptyState icon="📭" title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});

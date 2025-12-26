import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LastUpdated } from './LastUpdated';

describe('LastUpdated', () => {
  it('renders formatted timestamp', () => {
    const timestamp = '2024-01-15T10:30:00.000Z';
    render(<LastUpdated timestamp={timestamp} />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('handles null timestamp', () => {
    render(<LastUpdated timestamp={null} />);
    expect(screen.getByText('Last updated:')).toBeInTheDocument();
  });
});

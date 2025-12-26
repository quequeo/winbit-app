import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Winbit. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders processing hours info', () => {
    render(<Footer />);
    expect(screen.getByText(/processed between 8am-6pm/)).toBeInTheDocument();
  });
});

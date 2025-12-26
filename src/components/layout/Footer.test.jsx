import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Winbit. Todos los derechos reservados.`),
    ).toBeInTheDocument();
  });

  it('renders processing hours info', () => {
    render(<Footer />);
    expect(screen.getByText(/Las actualizaciones del portafolio/)).toBeInTheDocument();
  });
});

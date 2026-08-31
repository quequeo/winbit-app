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

  it('does not render support contact', () => {
    render(<Footer />);
    expect(screen.queryByText(/winbit\.cfds@gmail\.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Las actualizaciones del portafolio/)).not.toBeInTheDocument();
  });
});

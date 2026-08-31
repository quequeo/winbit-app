import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WinbitLogo } from './WinbitLogo';

describe('WinbitLogo', () => {
  it('renders logo image with alt text', () => {
    render(<WinbitLogo />);
    const img = screen.getByAltText('Winbit');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/login/logo-winbit.png');
  });

  it('does not render a separate tagline, since the artwork already includes it', () => {
    const { container } = render(<WinbitLogo />);
    expect(screen.queryByText(/GESTI[OÓ]N ACTIVA EN USD/i)).not.toBeInTheDocument();
    expect(container.querySelector('.winbit-logo-tagline')).toBeNull();
  });
});

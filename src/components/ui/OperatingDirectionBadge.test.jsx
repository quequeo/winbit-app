import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperatingDirectionBadge } from './OperatingDirectionBadge';

describe('OperatingDirectionBadge', () => {
  it('renders long badge with dashboard styles', () => {
    const { container } = render(
      <OperatingDirectionBadge direction="LONG" longLabel="Long" shortLabel="Short" />,
    );
    expect(screen.getByText('Long')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-direction-badge--long')).toBeInTheDocument();
  });

  it('renders short badge with dashboard styles', () => {
    const { container } = render(
      <OperatingDirectionBadge direction="SHORT" longLabel="Long" shortLabel="Short" />,
    );
    expect(screen.getByText('Short')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-direction-badge--short')).toBeInTheDocument();
  });

  it('renders nothing when direction is missing', () => {
    const { container } = render(
      <OperatingDirectionBadge direction={null} longLabel="Long" shortLabel="Short" />,
    );
    expect(container.firstChild).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssetBadge } from './AssetBadge';

describe('AssetBadge', () => {
  it('renders BTC in dark circle badge', () => {
    const { container } = render(<AssetBadge asset="MBT" size={46} />);
    expect(container.querySelector('.asset-badge--circle')).toBeInTheDocument();
    expect(screen.getByLabelText('Micro Bitcoin')).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/images/operating-assets/btc.png"]'),
    ).toBeInTheDocument();
  });

  it('renders MES as S&P 500 in dark circle badge', () => {
    const { container } = render(<AssetBadge asset="MES" size={46} />);
    expect(container.querySelector('.asset-badge--circle')).toBeInTheDocument();
    expect(screen.getByLabelText('S&P 500')).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/images/operating-assets/sp500.png"]'),
    ).toBeInTheDocument();
  });

  it('renders Nasdaq in dark circle with png logo', () => {
    const { container } = render(<AssetBadge asset="MNQ" size={46} />);
    expect(container.querySelector('.asset-badge--circle')).toBeInTheDocument();
    expect(screen.getByLabelText('Nasdaq')).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/images/operating-assets/nasdaq.png"]'),
    ).toBeInTheDocument();
  });

  it('renders Dow Jones in dark circle with png logo', () => {
    const { container } = render(<AssetBadge asset="MYM" size={46} />);
    expect(container.querySelector('.asset-badge--circle')).toBeInTheDocument();
    expect(screen.getByLabelText('Dow Jones')).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/images/operating-assets/dow-jones.png"]'),
    ).toBeInTheDocument();
  });
});

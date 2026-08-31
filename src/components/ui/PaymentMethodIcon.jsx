import { Building2, Globe } from 'lucide-react';
import { resolvePaymentMethodVariant } from '../../utils/paymentMethodVariant';
import { AssetBadge } from './AssetBadge';
import { ASSET_BADGE_SIZE_SUMMARY } from '../../utils/operatingTrade';

export const AssetLogo = ({ asset, className = '' }) => (
  <AssetBadge asset={asset} size={ASSET_BADGE_SIZE_SUMMARY} className={className} />
);

const BRAND_LOGOS = {
  lemon: '/images/payment-methods/lemon.png',
  cash: '/images/payment-methods/cash-usd.png',
  usdt: '/images/payment-methods/usdt.svg',
  usdc: '/images/payment-methods/usdc.svg',
  btc: '/images/payment-methods/btc.svg',
  sp500: '/images/payment-methods/sp500.svg',
};

const COMPACT_LOGO_CLASS = 'h-5 w-5 shrink-0 text-primary';

const logoClassForVariant = (variant, compact, className) => {
  if (compact) {
    if (BRAND_LOGOS[variant]) {
      return 'h-full w-full shrink-0 object-cover';
    }
    return `${COMPACT_LOGO_CLASS} h-full w-full`;
  }
  if (BRAND_LOGOS[variant]) {
    return `${className} object-cover`;
  }
  return className;
};

const BrandLogo = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

export const PaymentMethodIcon = ({
  variant,
  className = 'w-6 h-6',
  compact = false,
  strokeWidth: _sw = 1.75,
}) => {
  const iconClass = logoClassForVariant(variant, compact, className);
  const logo = BRAND_LOGOS[variant];

  if (logo) {
    return <BrandLogo src={logo} alt="" className={iconClass} />;
  }

  switch (variant) {
    case 'globe':
      return <Globe className={iconClass} strokeWidth={1.75} aria-hidden />;
    default:
      return <Building2 className={iconClass} strokeWidth={1.75} aria-hidden />;
  }
};
export const PaymentMethodIconFromOption = ({ option, className, strokeWidth }) => (
  <PaymentMethodIcon
    variant={resolvePaymentMethodVariant(option)}
    className={className}
    strokeWidth={strokeWidth}
  />
);

import { PaymentMethodIconFromOption } from '../components/ui/PaymentMethodIcon.jsx';

export const getDepositMethodIcon = (option) => {
  const Icon = (props) => <PaymentMethodIconFromOption option={option} {...props} />;
  Icon.displayName = 'DepositMethodIcon';
  return Icon;
};

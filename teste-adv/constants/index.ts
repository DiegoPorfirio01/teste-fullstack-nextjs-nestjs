import { CoinsIcon, GemIcon, ZapIcon } from 'lucide-react';

export const AUTH_COOKIE_NAME = 'auth-token';
export { REVERT_WINDOW_MS, MAX_AMOUNT, EMAIL_REGEX } from './transaction';

/** Route path -> label for breadcrumbs and nav. Shared with sidebar. */
export const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Painel',
  '/transactions': 'Transações',
  '/billing': 'Comprar Crédito',
  '/perfil': 'Conta',
};

/** Paths for main sidebar nav, in order. Labels come from ROUTE_LABELS. */
export const SIDEBAR_NAV_PATHS = [
  '/dashboard',
  '/transactions',
  '/billing',
] as const;

export const CREDIT_PACKAGES = [
  {
    id: '10',
    credits: 10,
    price: 'R$ 9,90',
    pricePerCredit: 'R$ 0,99',
    icon: CoinsIcon,
    popular: false,
    description: 'Ideal para teste',
  },
  {
    id: '50',
    credits: 50,
    price: 'R$ 44,90',
    pricePerCredit: 'R$ 0,90',
    icon: ZapIcon,
    popular: true,
    description: 'Melhor custo-benefício',
  },
  {
    id: '100',
    credits: 100,
    price: 'R$ 79,90',
    pricePerCredit: 'R$ 0,80',
    icon: GemIcon,
    popular: false,
    description: 'Máxima economia',
    discount: '19% off',
  },
];

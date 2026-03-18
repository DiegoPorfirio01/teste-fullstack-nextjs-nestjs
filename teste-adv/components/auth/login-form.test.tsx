import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginForm } from './login-form';

const mockLoginAction = vi.fn();

vi.mock('@/actions/auth', () => ({
  loginAction: (...args: unknown[]) => mockLoginAction(...args),
}));

// Next.js Image and Link
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginAction.mockResolvedValue(undefined);
  });

  it('renders heading and form fields', () => {
    render(<LoginForm />);
    expect(
      screen.getByRole('heading', { name: /bem-vindo de volta/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('renders register link', () => {
    render(<LoginForm />);
    const link = screen.getByRole('link', { name: /cadastre-se/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/auth/register');
  });

  it('submit button is enabled initially', () => {
    render(<LoginForm />);
    const button = screen.getByRole('button', { name: /entrar/i });
    expect(button).not.toBeDisabled();
  });
});

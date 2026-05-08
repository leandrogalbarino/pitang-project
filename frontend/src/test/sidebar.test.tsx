import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/components/ui/dashboard/Sidebar';
import { MemoryRouter } from 'react-router-dom';
import { Dialog } from '@/components/ui/dialog';
import { SWRConfig } from 'swr';

// Mock do hook useSWR
vi.mock('swr', () => ({
  default: () => ({ data: null, mutate: vi.fn() }),
  SWRConfig: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock do react-router-dom
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => mockedUsedNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  Navigate: vi.fn(),
}));

describe('Sidebar Component', () => {
  const mockSignOut = vi.fn();
  const mockUser = {
    id: '1',
    name: 'Test User',
    role: 'ADMIN',
  };

  it('Deve chamar signOut e navegar para login ao clicar em Sair', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <Dialog open={true}>
            <Sidebar user={mockUser as any} signOut={mockSignOut} />
          </Dialog>
        </MemoryRouter>
      </SWRConfig>,
    );

    const logoutButton = screen.getByText(/Sair da conta/i);
    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
  });
});

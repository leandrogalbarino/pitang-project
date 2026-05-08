import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/components/ui/dashboard/Sidebar';
import { BrowserRouter } from 'react-router-dom';
import { Dialog } from '@/components/ui/dialog';
import { SWRConfig } from 'swr';

// Mock do hook useSWR
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    default: () => ({ data: null, mutate: vi.fn() }),
  };
});

// Mock do useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as any),
    useNavigate: () => mockedUsedNavigate,
  };
});

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
        <BrowserRouter>
          <Dialog open={true}>
            <Sidebar user={mockUser as any} signOut={mockSignOut} />
          </Dialog>
        </BrowserRouter>
      </SWRConfig>,
    );

    const logoutButton = screen.getByText(/Sair da conta/i);
    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
  });
});

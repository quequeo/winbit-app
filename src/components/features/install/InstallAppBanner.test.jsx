import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InstallAppBanner } from './InstallAppBanner';
import * as install from '../../../utils/installPrompt';

vi.mock('../../../utils/installPrompt', () => ({
  dismissInstallBanner: vi.fn(),
  getInstallBannerMode: vi.fn(),
  promptInstall: vi.fn(),
  subscribeInstallPrompt: vi.fn(() => () => {}),
}));

describe('InstallAppBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    install.subscribeInstallPrompt.mockImplementation(() => () => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('en Android muestra "Instalar" y abre la instalación del navegador', async () => {
    install.getInstallBannerMode.mockReturnValue('prompt');
    install.promptInstall.mockResolvedValue('accepted');
    render(<InstallAppBanner />);

    expect(screen.getByText('Instalá la app de Winbit')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Instalar/ }));

    expect(install.promptInstall).toHaveBeenCalled();
    expect(install.dismissInstallBanner).not.toHaveBeenCalled();
    expect(screen.queryByTestId('install-app-banner')).not.toBeInTheDocument();
  });

  it('si el inversor cancela la instalación, no vuelve a molestar por un tiempo', async () => {
    install.getInstallBannerMode.mockReturnValue('prompt');
    install.promptInstall.mockResolvedValue('dismissed');
    render(<InstallAppBanner />);

    await userEvent.click(screen.getByRole('button', { name: /Instalar/ }));

    expect(install.dismissInstallBanner).toHaveBeenCalled();
  });

  it('en iPhone, después de una espera, explica "Agregar a inicio" con link al instructivo', () => {
    vi.useFakeTimers();
    install.getInstallBannerMode.mockReturnValue('ios');
    render(<InstallAppBanner />);

    expect(screen.queryByTestId('install-app-banner')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2600);
    });

    expect(screen.getByText(/tocá Compartir y después "Agregar a inicio"/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver cómo' })).toHaveAttribute('href', '/instalar');
  });

  it('"Ahora no" lo cierra y lo guarda', async () => {
    install.getInstallBannerMode.mockReturnValue('prompt');
    render(<InstallAppBanner />);

    await userEvent.click(screen.getByRole('button', { name: 'Ahora no' }));

    expect(install.dismissInstallBanner).toHaveBeenCalled();
    expect(screen.queryByTestId('install-app-banner')).not.toBeInTheDocument();
  });

  it('no aparece si la app ya está instalada o no corresponde', () => {
    install.getInstallBannerMode.mockReturnValue(null);
    const { container } = render(<InstallAppBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});

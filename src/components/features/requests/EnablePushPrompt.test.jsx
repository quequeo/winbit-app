import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnablePushPrompt } from './EnablePushPrompt';
import { getPushConfig } from '../../../services/api';
import * as push from '../../../services/push';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ userEmail: 'ana@example.com' }),
}));

vi.mock('../../../services/api', () => ({
  getPushConfig: vi.fn(),
}));

vi.mock('../../../services/push', () => ({
  dismissPrompt: vi.fn(),
  enablePush: vi.fn(),
  getPermission: vi.fn(),
  isIos: vi.fn(),
  isPushSupported: vi.fn(),
  isStandalone: vi.fn(),
  wasPromptDismissed: vi.fn(),
}));

describe('EnablePushPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    push.wasPromptDismissed.mockReturnValue(false);
    push.isIos.mockReturnValue(false);
    push.isStandalone.mockReturnValue(false);
    push.isPushSupported.mockReturnValue(true);
    push.getPermission.mockReturnValue('default');
    getPushConfig.mockResolvedValue({ data: { enabled: true, publicKey: 'k' }, error: null });
  });

  it('ofrece activar los avisos y confirma cuando quedan activos', async () => {
    push.enablePush.mockResolvedValue({ ok: true });
    render(<EnablePushPrompt />);

    await userEvent.click(await screen.findByRole('button', { name: 'Activar avisos' }));

    expect(push.enablePush).toHaveBeenCalledWith('ana@example.com');
    expect(await screen.findByText(/te vamos a avisar en este celular/)).toBeInTheDocument();
    expect(push.dismissPrompt).toHaveBeenCalled();
  });

  it('explica cómo desbloquearlos si el inversor no dio permiso', async () => {
    push.enablePush.mockResolvedValue({ ok: false, reason: 'denied' });
    render(<EnablePushPrompt />);

    await userEvent.click(await screen.findByRole('button', { name: 'Activar avisos' }));

    expect(await screen.findByText(/quedaron bloqueados/)).toBeInTheDocument();
  });

  it('"Ahora no" la oculta y no la vuelve a mostrar', async () => {
    render(<EnablePushPrompt />);

    await userEvent.click(await screen.findByRole('button', { name: 'Ahora no' }));

    expect(push.dismissPrompt).toHaveBeenCalled();
    expect(screen.queryByTestId('enable-push-prompt')).not.toBeInTheDocument();
  });

  it('en iPhone sin la app instalada explica que hay que instalarla', () => {
    push.isIos.mockReturnValue(true);
    render(<EnablePushPrompt />);

    expect(screen.getByText(/primero instalá la app en la pantalla de inicio/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cómo instalarla' })).toHaveAttribute(
      'href',
      '/instalar',
    );
  });

  it('no aparece si ya dio permiso, si lo descartó o si el servidor no tiene avisos', async () => {
    push.getPermission.mockReturnValue('granted');
    const first = render(<EnablePushPrompt />);
    expect(first.container).toBeEmptyDOMElement();
    first.unmount();

    push.getPermission.mockReturnValue('default');
    push.wasPromptDismissed.mockReturnValue(true);
    const second = render(<EnablePushPrompt />);
    expect(second.container).toBeEmptyDOMElement();
    second.unmount();

    push.wasPromptDismissed.mockReturnValue(false);
    getPushConfig.mockResolvedValue({ data: { enabled: false, publicKey: null }, error: null });
    const third = render(<EnablePushPrompt />);
    await waitFor(() => expect(getPushConfig).toHaveBeenCalled());
    expect(third.container).toBeEmptyDOMElement();
  });
});

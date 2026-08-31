import { Component } from 'react';
import { i18n } from '../i18n';
import { Spinner } from './ui/Spinner';

/** Firefox/Safari/Chrome error strings para módulos JS que un deploy nuevo dejó sin servir. */
const CHUNK_LOAD_ERROR_PATTERN =
  /fetch dynamically imported module|loading dynamically imported module|loading chunk|importing a module script failed/i;

const CHUNK_RELOAD_FLAG = 'winbit_chunk_reload_attempted';

const isChunkLoadError = (error) => CHUNK_LOAD_ERROR_PATTERN.test(error?.message ?? '');

const alreadyTriedReload = () => {
  try {
    return globalThis?.sessionStorage?.getItem(CHUNK_RELOAD_FLAG) === '1';
  } catch {
    return false;
  }
};

const markReloadAttempted = () => {
  try {
    globalThis?.sessionStorage?.setItem(CHUNK_RELOAD_FLAG, '1');
  } catch {
    // ignore storage errors
  }
};

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);

    // Deploy nuevo invalidó un chunk que el navegador tenía cacheado: recargar
    // una vez arregla solo, sin mostrar la pantalla de error al usuario.
    if (isChunkLoadError(error) && !alreadyTriedReload()) {
      markReloadAttempted();
      globalThis?.location?.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      // Primer chunk error: componentDidCatch ya va a recargar la página.
      // Mostrar un spinner en vez del cartel de error evita el flash feo.
      if (isChunkLoadError(this.state.error) && !alreadyTriedReload()) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-[#0D0F0E]">
            <Spinner size="lg" />
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#0D0F0E]">
          <div className="max-w-md w-full rounded-[14px] border border-[#28312D] bg-[#141716] p-8 text-center shadow-none">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(201,108,103,0.28)] bg-[rgba(201,108,103,0.14)] text-error">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {i18n.t('errors.boundaryTitle')}
            </h1>
            <p className="text-text-muted mb-6">{i18n.t('errors.boundaryMessage')}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 primary-button font-semibold rounded-[14px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D0F0E] focus:ring-primary"
            >
              {i18n.t('errors.refreshPage')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

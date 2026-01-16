import { render, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new client for every test to avoid shared state
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // Turn off retries for testing
        },
    },
});

export const createWrapper = () => {
    const queryClient = createTestQueryClient();
    const Wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'TestWrapper';
    return Wrapper;
};

const customRender = (ui, options) => {
    const queryClient = createTestQueryClient();
    const Wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'TestRenderWrapper';
    return render(ui, { wrapper: Wrapper, ...options });
};

const customRenderHook = (hook, options) => {
    const queryClient = createTestQueryClient();
    const Wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'TestHookWrapper';
    return renderHook(hook, { wrapper: Wrapper, ...options });
};

// Override render and renderHook
export { customRender as render, customRenderHook as renderHook };

// Re-export everything else from testing library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

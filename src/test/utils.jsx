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
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

const customRender = (ui, options) => {
    const queryClient = createTestQueryClient();
    const Wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return render(ui, { wrapper: Wrapper, ...options });
};

const customRenderHook = (hook, options) => {
    const queryClient = createTestQueryClient();
    const Wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return renderHook(hook, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';

// Override render and renderHook
export { customRender as render, customRenderHook as renderHook };

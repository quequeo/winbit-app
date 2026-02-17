import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/features/auth/AuthProvider';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Spinner } from './components/ui/Spinner';
import { ErrorBoundary } from './components/ErrorBoundary';

const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const WalletsPage = lazy(() =>
  import('./pages/WalletsPage').then((m) => ({ default: m.WalletsPage })),
);
const RequestsPage = lazy(() =>
  import('./pages/RequestsPage').then((m) => ({ default: m.RequestsPage })),
);
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);
const OperatingPage = lazy(() =>
  import('./pages/OperatingPage').then((m) => ({ default: m.OperatingPage })),
);
const ChangePasswordPage = lazy(() =>
  import('./pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })),
);

const PageFallback = () => (
  <div className="flex justify-center items-center py-20">
    <Spinner size="lg" />
  </div>
);

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Header />
                    <main className="flex-1 container mx-auto px-4 py-8">
                      <Suspense fallback={<PageFallback />}>
                        <Routes>
                          <Route path="/dashboard" element={<DashboardPage />} />
                          <Route path="/wallets" element={<WalletsPage />} />
                          <Route path="/requests" element={<RequestsPage />} />
                          <Route path="/history" element={<HistoryPage />} />
                          <Route path="/operational" element={<OperatingPage />} />
                          <Route path="/change-password" element={<ChangePasswordPage />} />
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

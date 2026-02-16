import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/features/auth/AuthProvider';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WalletsPage } from './pages/WalletsPage';
import { RequestsPage } from './pages/RequestsPage';
import { HistoryPage } from './pages/HistoryPage';
import { OperatingPage } from './pages/OperatingPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Header />
                  <main className="flex-1 container mx-auto px-4 py-8">
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
                  </main>
                  <Footer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

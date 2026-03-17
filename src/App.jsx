import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import NewEventPage from './pages/NewEventPage';
import AdminPage from './pages/AdminPage';
import CalendarPage from './pages/CalendarPage';
import RegionsPage from './pages/RegionsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const hydrateToken = useAuthStore((s) => s.hydrateToken);
  useEffect(() => { hydrateToken(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/events" replace />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<NewEventPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="admin" element={
            <ProtectedRoute adminOnly>
            <AdminPage />
            </ProtectedRoute>
            } />
           <Route path="regions" element={
              <ProtectedRoute adminOnly>
                <RegionsPage />
              </ProtectedRoute>
            } />
          </Route>
      </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

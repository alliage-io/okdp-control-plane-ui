import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/auth/auth-context';
import { AuthRedirector } from './core/auth/auth-redirector';

// Gate rendering until the OIDC check completes (APP_INITIALIZER equivalent)
function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth();
  if (!ready) {
    return null;
  }
  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
          <AuthRedirector />
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  );
}

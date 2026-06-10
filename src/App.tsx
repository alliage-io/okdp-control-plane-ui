import { BrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider, useAuth } from './core/auth/auth-context';
import { AuthRedirector } from './core/auth/auth-redirector';
import { ProjectContextProvider } from './core/context/project-context';
import { AppRoutes } from './app-routes';

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
    <PrimeReactProvider value={{ ripple: true }}>
      <BrowserRouter>
        <AuthProvider>
          <AuthGate>
            <AuthRedirector />
            <ProjectContextProvider>
              <AppRoutes />
            </ProjectContextProvider>
          </AuthGate>
        </AuthProvider>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

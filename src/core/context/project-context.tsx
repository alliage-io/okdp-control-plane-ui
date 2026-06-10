/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi, type Project, type ProjectEvent } from '../api/project-api';
import { logger } from '../services/logger';

const STORAGE_KEY = 'okdp-selected-projectId';

export interface ProjectContextValue {
  availableProjects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  isLoading: boolean;
  selectProject: (projectId: string) => void;
  /** Sync the context from a route param without navigating (guard equivalent). */
  setProjectFromRoute: (projectId: string) => void;
  getLastSelectedProjectId: () => string | null;
  clearContext: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function applyEvent(list: Project[], event: ProjectEvent): Project[] {
  const project = event.object;
  switch (event.type) {
    case 'ADDED':
      return list.some((p) => p.name === project.name) ? list : [...list, project];
    case 'MODIFIED':
      return list.map((p) => (p.name === project.name ? project : p));
    case 'DELETED':
      return list.filter((p) => p.name !== project.name);
    default:
      return list;
  }
}

export function ProjectContextProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    () => sessionStorage.getItem(STORAGE_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Projects list: initial REST fetch merged with SSE updates
  useEffect(() => {
    let cancelled = false;

    projectApi
      .getProjects()
      .then((projects) => {
        if (!cancelled) {
          setAvailableProjects(projects);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        logger.error('Fatal error in projects stream', err);
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    const unsubscribe = projectApi.subscribeProjects({
      next: (event) => setAvailableProjects((list) => applyEvent(list, event)),
      error: (err) => logger.error('SSE Stream error', err),
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const selectProject = useCallback(
    (projectId: string) => {
      if (!projectId) return;

      setCurrentProjectId(projectId);
      sessionStorage.setItem(STORAGE_KEY, projectId);

      // Navigate — preserve the current sub-route (e.g. secret-stores)
      const currentUrl = window.location.pathname;
      const projectPathMatch = currentUrl.match(/^\/project\/[^/]+(\/.*)?$/);
      const subPath = projectPathMatch?.[1] ?? '';
      navigate(`/project/${projectId}${subPath}`);
    },
    [navigate],
  );

  const setProjectFromRoute = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
    sessionStorage.setItem(STORAGE_KEY, projectId);
  }, []);

  const clearContext = useCallback(() => {
    setCurrentProjectId(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Enforce consistency: selected project disappeared from the list
  useEffect(() => {
    // Do not intervene during initial load
    if (isLoading) return;

    if (currentProjectId && !availableProjects.find((p) => p.name === currentProjectId)) {
      logger.warn(`Selected project '${currentProjectId}' is no longer available.`);

      if (availableProjects.length === 0) {
        clearContext();
        if (!window.location.pathname.startsWith('/admin')) {
          navigate('/admin/projects');
        }
      } else {
        selectProject(availableProjects[0].name);
      }
    }
  }, [availableProjects, currentProjectId, isLoading, clearContext, selectProject, navigate]);

  const value = useMemo<ProjectContextValue>(
    () => ({
      availableProjects,
      currentProjectId,
      currentProject: availableProjects.find((p) => p.name === currentProjectId) || null,
      isLoading,
      selectProject,
      setProjectFromRoute,
      getLastSelectedProjectId: () => sessionStorage.getItem(STORAGE_KEY),
      clearContext,
    }),
    [availableProjects, currentProjectId, isLoading, selectProject, setProjectFromRoute, clearContext],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjectContext must be used within a ProjectContextProvider');
  }
  return ctx;
}

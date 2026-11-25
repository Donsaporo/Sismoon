import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type RouterState = {
  path: string;
  query: URLSearchParams;
  anchor: string | null;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterState>({ path: '/', query: new URLSearchParams(), anchor: null, navigate: () => {} });

export function usePath(): string {
  return useContext(RouterContext).path;
}

export function useQuery(): URLSearchParams {
  return useContext(RouterContext).query;
}

export function useAnchor(): string | null {
  return useContext(RouterContext).anchor;
}

export function useNavigate(): (to: string) => void {
  return useContext(RouterContext).navigate;
}

const APP_ROUTES = new Set([
  '/', '/alojamientos', '/habitaciones', '/villas', '/glamping',
  '/experiencias', '/isla-grande', '/acerca-de', '/galeria',
  '/contacto', '/reservar', '/reservar/checkout',
]);

function isAppRoute(path: string): boolean {
  if (APP_ROUTES.has(path)) return true;
  if (/^\/villas\/villa-[1-5]$/.test(path)) return true;
  if (/^\/habitaciones\/sm-(?:1|2|3|5|6|7|8|9|10|11)$/.test(path)) return true;
  return false;
}

function parseHash(): { path: string; query: URLSearchParams; anchor: string | null } {
  let raw = window.location.hash.slice(1);
  let anchor: string | null = null;

  if (!raw) {
    const pathname = window.location.pathname;
    if (pathname && pathname !== '/' && isAppRoute(pathname)) {
      const hist = window.history as History & { replaceState?: (s: unknown, t: string, u: string) => void };
      hist.replaceState?.(null, '', `/#${pathname}${window.location.search}`);
      raw = pathname.slice(1) + window.location.search;
    } else {
      raw = '/';
    }
  }

  const anchorIdx = raw.indexOf('#');
  if (anchorIdx >= 0) {
    anchor = raw.slice(anchorIdx + 1);
    raw = raw.slice(0, anchorIdx);
  }
  const [rawPath, queryString] = raw.split('?');
  const path = rawPath === '' ? '/' : rawPath.replace(/\/+$/, '') || '/';
  const query = new URLSearchParams(queryString ?? '');
  return { path, query, anchor };
}

function buildHash(path: string, query?: URLSearchParams): string {
  const qs = query?.toString();
  return qs ? `${path}?${qs}` : path;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(parseHash);

  useEffect(() => {
    const onPop = (): void => setState(parseHash());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  const navigate = (to: string): void => {
    const hash = to.startsWith('#') ? to.slice(1) : to;
    let targetPath = hash;
    let targetAnchor: string | null = null;
    const anchorIdx = targetPath.indexOf('#');
    if (anchorIdx >= 0) {
      targetAnchor = targetPath.slice(anchorIdx + 1);
      targetPath = targetPath.slice(0, anchorIdx);
    }
    const [rawPath, queryString] = targetPath.split('?');
    const target = rawPath === '' ? '/' : rawPath.replace(/\/+$/, '') || '/';

    const current = parseHash();
    if (target === current.path && queryString === (current.query.toString() || undefined)) {
      if (targetAnchor) {
        document.getElementById(targetAnchor)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.location.hash = buildHash(target, queryString ? new URLSearchParams(queryString) : undefined);
    setState(parseHash());
    if (targetAnchor) {
      setTimeout(() => document.getElementById(targetAnchor)?.scrollIntoView({ behavior: 'smooth' }), 80);
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  return <RouterContext.Provider value={{ path: state.path, query: state.query, anchor: state.anchor, navigate }}>{children}</RouterContext.Provider>;
}

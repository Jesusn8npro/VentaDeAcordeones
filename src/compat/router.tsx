'use client'

/**
 * Capa de compatibilidad react-router-dom → next/navigation.
 *
 * Objetivo: migrar un archivo = cambiar SOLO el import:
 *   - import { useNavigate, Link, ... } from 'react-router-dom'
 *   + import { useNavigate, Link, ... } from '@/compat/router'
 *
 * Misma API que react-router-dom (la usada en este proyecto):
 *   useNavigate, useLocation, useParams, useSearchParams, Link, Navigate.
 * NavLink/Outlet incluidos por contrato (apenas usados).
 *
 * <Routes>/<Route>/<BrowserRouter> NO se exportan a propósito: desaparecen
 * al migrar a App Router (cada Route pasa a ser app/<ruta>/page.tsx).
 */

import React, { useCallback, useEffect, useMemo } from 'react'
import NextLink from 'next/link'
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'

type To = string | { pathname?: string; search?: string; hash?: string }

function toHref(to: To): string {
  if (typeof to === 'string') return to
  const { pathname = '', search = '', hash = '' } = to || {}
  return `${pathname}${search}${hash}`
}

// ── useNavigate ──────────────────────────────────────────────────────────────
export function useNavigate() {
  const router = useRouter()
  return useCallback(
    (to: To | number, options?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === 'number') {
        if (to < 0) router.back()
        else router.forward()
        return
      }
      const href = toHref(to)
      if (options?.replace) router.replace(href)
      else router.push(href)
    },
    [router]
  )
}

// ── useLocation ──────────────────────────────────────────────────────────────
// Memoizado: referencia ESTABLE mientras pathname/search no cambien (como
// react-router). Sin esto, devolver un objeto nuevo por render hacía que
// cualquier useEffect([location]) entrara en bucle infinito.
export function useLocation() {
  const pathname = usePathname() || '/'
  const sp = useNextSearchParams()
  const qs = sp ? sp.toString() : ''
  return useMemo(
    () => ({
      pathname,
      search: qs ? `?${qs}` : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state:
        typeof window !== 'undefined'
          ? (window.history.state?.usr ?? null)
          : null,
      key: 'default',
    }),
    [pathname, qs]
  )
}

// ── useParams ────────────────────────────────────────────────────────────────
export function useParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>
>(): T {
  return (useNextParams() || {}) as unknown as T
}

// ── useSearchParams (tupla, como react-router) ───────────────────────────────
type SearchParamsInit =
  | URLSearchParams
  | string
  | Record<string, string>
  | ((prev: URLSearchParams) => URLSearchParams)

export function useSearchParams(): [
  URLSearchParams,
  (next: SearchParamsInit, opts?: { replace?: boolean }) => void
] {
  const sp = useNextSearchParams()
  const router = useRouter()
  const pathname = usePathname() || '/'
  const qs = sp ? sp.toString() : ''

  // Referencia ESTABLE de URLSearchParams mientras la query no cambie.
  // Antes se creaba un objeto nuevo por render → useEffect([searchParams])
  // en bucle infinito → inundación de fetches a Supabase.
  const current = useMemo(() => new URLSearchParams(qs), [qs])

  const setSearchParams = useCallback(
    (next: SearchParamsInit, opts?: { replace?: boolean }) => {
      const resolved =
        typeof next === 'function'
          ? next(new URLSearchParams(qs))
          : next
      const usp =
        resolved instanceof URLSearchParams
          ? resolved
          : new URLSearchParams(resolved as Record<string, string>)
      const q = usp.toString()
      const url = q ? `${pathname}?${q}` : pathname
      if (opts?.replace) router.replace(url)
      else router.push(url)
    },
    [router, pathname, qs]
  )

  return useMemo(
    () => [current, setSearchParams] as [
      URLSearchParams,
      (next: SearchParamsInit, opts?: { replace?: boolean }) => void
    ],
    [current, setSearchParams]
  )
}

// ── Link ─────────────────────────────────────────────────────────────────────
type LinkProps = Omit<React.ComponentProps<typeof NextLink>, 'href'> & {
  to: To
  state?: unknown // ignorado (Next no soporta state en navegación)
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ to, state: _state, ...rest }, ref) {
    return <NextLink ref={ref} href={toHref(to)} {...rest} />
  }
)

// NavLink: como Link; className puede ser función (isActive) en react-router.
type NavLinkProps = Omit<LinkProps, 'className'> & {
  className?: string | ((p: { isActive: boolean }) => string)
  end?: boolean
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink({ to, state: _state, className, end, ...rest }, ref) {
    const pathname = usePathname() || '/'
    const href = toHref(to)
    const isActive = end ? pathname === href : pathname.startsWith(href)
    const cls = typeof className === 'function' ? className({ isActive }) : className
    return <NextLink ref={ref} href={href} className={cls} {...rest} />
  }
)

// ── Navigate (redirección declarativa) ───────────────────────────────────────
export function Navigate({
  to,
  replace,
}: {
  to: To
  replace?: boolean
  state?: unknown
}) {
  const router = useRouter()
  const href = toHref(to)
  useEffect(() => {
    if (replace) router.replace(href)
    else router.push(href)
  }, [router, href, replace])
  return null
}

// ── Outlet (contrato; en App Router el layout pasa {children}) ───────────────
export function Outlet({ children }: { children?: React.ReactNode }) {
  return <>{children ?? null}</>
}

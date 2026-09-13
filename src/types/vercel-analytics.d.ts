declare module "@vercel/analytics" {
  interface AnalyticsProps {
    beforeSend?: (event: { type: "pageview" | "event"; url?: string }) => { type: "pageview" | "event"; url?: string } | null;
    debug?: boolean;
    mode?: "auto" | "development" | "production";
    scriptSrc?: string;
    dsn?: string;
    eventEndpoint?: string;
    viewEndpoint?: string;
    sessionEndpoint?: string;
    endpoint?: string;
    framework?: string;
    disableAutoTrack?: boolean;
    route?: string | null;
    path?: string | null;
    basePath?: string;
    configString?: string;
  }

  export function inject(props?: AnalyticsProps, confString?: string): void;
  export function track(
    name: string,
    properties?: Record<string, string | number | boolean | null | undefined>,
    options?: { flags?: Record<string, unknown> | Array<string | Record<string, unknown>> }
  ): void;
  export function pageview(payload?: { route?: string | null; path?: string }): void;
  export function computeRoute(pathname: string | null, pathParams: Record<string, string | string[]> | null): string | null;
}

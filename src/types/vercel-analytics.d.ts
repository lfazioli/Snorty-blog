declare module "@vercel/analytics/react" {
  import type { JSX } from "react";

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
    route?: string | null;
    path?: string | null;
    basePath?: string;
    configString?: string;
  }

  export function Analytics(props?: AnalyticsProps): JSX.Element | null;
  export function track(
    name: string,
    properties?: Record<string, string | number | boolean | null | undefined>,
    options?: { flags?: Record<string, unknown> | Array<string | Record<string, unknown>> }
  ): void;
}

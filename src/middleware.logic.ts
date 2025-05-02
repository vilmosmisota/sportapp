/**
 * Domain information extracted from the host header
 */
export interface DomainInfo {
  subDomain: string;
  rootDomain: string;
  protocol: string;
}

/**
 * Parse a hostname into subdomain, root domain, and protocol
 */
export function parseDomain(host: string): DomainInfo {
  if (host === "localhost:3000") {
    return {
      subDomain: "localhost",
      rootDomain: "localhost:3000",
      protocol: "http",
    };
  }

  const domainParts = host.split(".");
  const subDomain = domainParts[0];
  const rootDomain = domainParts.slice(1).join(".");
  const protocol = rootDomain.includes("localhost") ? "http" : "https";

  return { subDomain, rootDomain, protocol };
}

/**
 * Check if the host is the root domain
 */
export function isRootDomain(host: string): boolean {
  return host === "sportwise.net" || host === "localhost:3000";
}

/**
 * Construct a redirect URL with the subdomain
 */
export function constructRedirectUrl(
  path: string,
  subDomain: string,
  rootDomain: string,
  protocol: string
): string {
  return `${protocol}://${subDomain}.${rootDomain}${path}`;
}

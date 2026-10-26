"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * Internal link with prefetch turned off.
 *
 * Next 16's static export emits the RSC payload needed for client-side
 * navigation, but the speculative prefetch URL it requests
 * (`/<route>/__next.<route>.__PAGE__.txt`) is not part of the export — so every
 * page load logs a harmless 404. Navigation itself works fine either way; we
 * just don't want a red console on a static marketing site.
 *
 * On a 5-page static site prefetch buys nothing measurable, and clicking a link
 * still transitions client-side.
 */
export function Link({ prefetch, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch ?? false} {...props} />;
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { LinkHint } from '@/components/dashboard/link-hint';
import { ROUTE_LABELS } from '@/constants';

function humanize(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function buildBreadcrumbItems(
  pathname: string,
): { href: string; label: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const items: { href: string; label: string }[] = [];
  let cumulative = '';

  for (const segment of segments) {
    cumulative += `/${segment}`;
    const label = ROUTE_LABELS[cumulative] ?? humanize(segment);
    items.push({ href: cumulative, label });
  }

  return items;
}

export function SiteHeaderBreadcrumbs() {
  const pathname = usePathname();
  const items = buildBreadcrumbItems(pathname);

  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} prefetch={false}>
                      {item.label}
                      <LinkHint />
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

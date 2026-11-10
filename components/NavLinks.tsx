"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; primary?: boolean };

export function NavLinks({ items, label }: { items: Item[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label={label}>
      <ul>
        {items.map((item) => {
          const current = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={item.primary ? "nav-link nav-rsvp" : "nav-link"}
                aria-current={current ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

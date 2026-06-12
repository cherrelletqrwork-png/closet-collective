import type { ReactNode } from "react";
import { CursorTrail } from "./CursorTrail";
import { Footer } from "./Footer";
import { Nav } from "./Nav";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <CursorTrail />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

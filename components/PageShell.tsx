import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Nav } from "./Nav";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

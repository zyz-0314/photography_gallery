import Link from "next/link";
import { PageTransition } from "@/components/ui/PageTransition";

export default function NotFound() {
  return (
    <PageTransition className="pt-16">
      <section className="mx-auto flex min-h-[80svh] max-w-[1600px] flex-col items-start justify-center px-6 lg:px-10">
        <p className="label text-faint">404</p>
        <h1 className="headline mt-8 text-[clamp(40px,8vw,96px)]">
          NOTHING HERE.
        </h1>
        <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-muted">
          This frame is empty. Maybe the photograph was never taken.
        </p>
        <Link
          href="/"
          className="label mt-12 text-muted transition-colors hover:text-paper"
        >
          ← BACK TO MAIN
        </Link>
      </section>
    </PageTransition>
  );
}

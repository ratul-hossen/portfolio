import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-5 text-center">
      <div>
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
        <ButtonLink href="/" className="mt-8">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}

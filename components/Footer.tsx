import * as React from "react";

export function Footer(): React.ReactElement {
  return (
    <footer className="mt-auto border-t border-border bg-card py-8 text-center text-sm text-muted">
      <p className="mx-auto max-w-3xl px-4">
        AutoPulse is an independent search tool and is not affiliated with,
        endorsed by, or connected to Meta or Facebook in any way.
      </p>
    </footer>
  );
}

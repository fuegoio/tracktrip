import { toast } from "sonner";
import { useEffect } from "react";

/**
 * Install toast if we detect that the PWA is ready.
 */
export function Install() {
  useEffect(() => {
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.addEventListener("beforeinstallprompt", (e: any) => {
        e.preventDefault();

        toast("You can install this application", {
          action: {
            label: "Install",
            onClick: () => {
              e.prompt();
            },
          },
          closeButton: true,
        });
      });
    }
  });

  return null;
}

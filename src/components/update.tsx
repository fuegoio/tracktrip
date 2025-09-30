import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function Update() {
  const { updateServiceWorker } = useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      toast("A new version is available", {
        action: {
          label: "Reload",
          onClick: () => {
            updateServiceWorker(true);
          },
        },
        duration: Infinity,
        closeButton: true,
      });
    },
  });

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

import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

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

  return null;
}

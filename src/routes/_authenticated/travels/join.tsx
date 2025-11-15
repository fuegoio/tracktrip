import { useEffect, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

export const Route = createFileRoute("/_authenticated/travels/join")({
  component: JoinTravelPage,
  validateSearch: (search) => {
    return z.object({ code: z.string() }).parse(search);
  },
  onError: () => {
    throw redirect({
      to: "/travels",
    });
  },
});

function JoinTravelPage() {
  const navigate = Route.useNavigate();
  const { code } = Route.useSearch();
  const isMutationHasRun = useRef(false);

  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    ...trpc.travels.joinByCode.mutationOptions(),
    onSuccess: async (data) => {
      setError(null);
      await navigate({
        to: "/travels/$travelId",
        params: { travelId: data.item.id },
      });
      toast.success(`Successfully joined ${data.item.name}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (!isMutationHasRun.current) {
      isMutationHasRun.current = true;
      mutate({
        code,
      });
    }
  }, [code, mutate, navigate]);

  return (
    <div className="h-full flex flex-col items-center justify-center dark text-foreground">
      {isPending && !error && (
        <>
          <LoaderCircle className="animate-spin h-12 w-12 mb-4" />
          Joining travel...
        </>
      )}

      {error && (
        <>
          <div className="font-medium">{error}</div>

          <Button asChild className="mt-8" variant="secondary">
            <Link to="/travels">
              Go home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}

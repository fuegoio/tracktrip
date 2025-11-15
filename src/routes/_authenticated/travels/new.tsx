import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import z from "zod";

import { travelSettingsFormSchema } from "@/components/travels/travel-schema";
import { TravelSettings } from "@/components/travels/travel-settings";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { travelsCollection } from "@/store/collections";

export const Route = createFileRoute("/_authenticated/travels/new")({
  component: NewTravel,
});

function NewTravel() {
  const navigate = useNavigate({ from: "/travels/new" });
  const { session } = Route.useRouteContext();

  const form = useForm<z.infer<typeof travelSettingsFormSchema>>({
    resolver: zodResolver(travelSettingsFormSchema),
    defaultValues: {
      emoji: "🚄",
      currency: "EUR",
    },
  });

  const onSubmit = (values: z.infer<typeof travelSettingsFormSchema>) => {
    const id = crypto.randomUUID();
    travelsCollection.insert({
      id,
      ...values,
      users: [
        {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? null,
          role: "owner",
        },
      ],
    });
    navigate({ to: "/travels/$travelId", params: { travelId: id } });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="w-full flex items-center justify-between px-4 py-3 absolute">
        <div className="flex items-center dark">
          <Button className="px-2.5!" variant="ghost" asChild>
            <Link to="/travels">
              <ArrowLeft className="size-5 text-foreground" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu user={session.user} />
        </div>
      </div>

      <div className="dark p-6 mt-10">
        <h1 className="text-4xl mt-8 text-foreground">Start a new travel</h1>
        <h2 className=""></h2>
      </div>

      <div className="bg-background rounded-t-2xl flex-1">
        <div className="px-6 py-4">
          <div className="font-semibold text-foreground text-lg">
            Travel information
          </div>
          <div className="text-sm text-subtle-foreground">
            You will be able to change this later if needed.
          </div>
        </div>

        <TravelSettings form={form} onSubmit={onSubmit} />
      </div>
    </div>
  );
}

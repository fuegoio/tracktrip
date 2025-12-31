import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import z from "zod";

import type { Travel } from "@/data/travels";

import { BudgetSettings } from "@/components/budgets/budget-settings";
import { travelSettingsFormSchema } from "@/components/travels/travel-schema";
import { TravelSettings } from "@/components/travels/travel-settings";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { Travellers } from "@/components/users/travellers";
import { cn } from "@/lib/utils";
import { travelsCollection } from "@/store/collections";

export const Route = createFileRoute("/_authenticated/travels/new")({
  component: NewTravel,
});

function NewTravel() {
  const navigate = useNavigate({ from: "/travels/new" });
  const { session } = Route.useRouteContext();
  const [step, setStep] = useState(0);
  const [travel, setTravel] = useState<Travel | undefined>();

  const form = useForm<z.infer<typeof travelSettingsFormSchema>>({
    resolver: zodResolver(travelSettingsFormSchema),
    defaultValues: {
      emoji: "🚄",
      currency: "EUR",
    },
  });

  const onSubmit = (values: z.infer<typeof travelSettingsFormSchema>) => {
    const id = crypto.randomUUID();
    const travel: Travel = {
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
      currencyRates: [],
    };
    setTravel(travel);
    setStep(1);

    travelsCollection.insert(travel);
  };

  const skip = () => {
    if (!travel) return;
    navigate({ to: "/travels/$travelId", params: { travelId: travel.id } });
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
        <h1 className="text-5xl mt-8 text-foreground font-medium text-center">
          Start an adventure
        </h1>
      </div>

      <div className="p-4 overflow-y-auto">
        <div className="bg-background rounded-2xl py-4">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <TravelSettings form={form} onSubmit={onSubmit} />
                <div className="text-xs text-subtle-foreground text-center">
                  You will be able to change this later if needed.
                </div>
              </motion.div>
            )}

            {step === 1 && travel && (
              <motion.div
                key="budget"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-2"
              >
                <BudgetSettings
                  travelId={travel.id}
                  onboarding
                  onSave={() => setStep(2)}
                />
              </motion.div>
            )}

            {step === 2 && travel && (
              <motion.div
                key="travellers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Travellers travelId={travel.id} />
                <div className="px-5">
                  <Button variant="secondary" onClick={skip} className="w-full">
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-4 dark">
        <div
          className={cn(
            "rounded-full border bg-white/50 size-3 transition-colors",
            step >= 0 ? "bg-white/50" : "bg-white/5",
          )}
        />
        <div
          className={cn(
            "rounded-full border bg-white/50 size-3 transition-colors",
            step >= 1 ? "bg-white/50" : "bg-white/5",
          )}
        />
        <div
          className={cn(
            "rounded-full border bg-white/50 size-3 transition-colors",
            step >= 2 ? "bg-white/50" : "bg-white/5",
          )}
        />
      </div>
    </div>
  );
}

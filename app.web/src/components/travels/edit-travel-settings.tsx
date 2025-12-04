import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import z from "zod";

import { travelSettingsFormSchema } from "./travel-schema";
import { TravelSettings } from "./travel-settings";

import type { Travel } from "@/data/travels";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { travelsCollection } from "@/store/collections";

export const EditTravelSettings = ({
  travel,
  isOpen,
  setIsOpen,
}: {
  travel: Travel;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof travelSettingsFormSchema>>({
    resolver: zodResolver(travelSettingsFormSchema),
    defaultValues: {
      ...travel,
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = (values: z.infer<typeof travelSettingsFormSchema>) => {
    if (isDirty) {
      travelsCollection.update(travel.id, (travel) => {
        Object.assign(travel, values);

        form.reset({
          ...travel,
        });
      });
    }

    setIsOpen(false);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    form.reset();
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={closeDrawer}>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex justify-between">
            <div>
              <DrawerTitle className="font-semibold text-lg text-foreground">
                Edit travel
              </DrawerTitle>
              <DrawerDescription>
                Edit the settings of your travel.
              </DrawerDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={closeDrawer}>
              <X className="size-5" />
            </Button>
          </div>
        </div>

        <TravelSettings
          form={form}
          onSubmit={onSubmit}
          submitText="Edit travel"
        />
      </DrawerContent>
    </Drawer>
  );
};

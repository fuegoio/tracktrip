import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { placesCollection } from "@/store/collections";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";

const formSchema = z.object({
  name: z.string("Name is required.").min(1, "Name is required."),
});

export const NewPlaceDrawer = ({ travelId }: { travelId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Get existing places for this travel
  const { data: existingPlaces } = useLiveQuery((q) =>
    q
      .from({ places: placesCollection })
      .where(({ places }) => eq(places.travel, travelId)),
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Check if place with same name already exists
    const placeExists = existingPlaces?.some(
      (place) => place.name.toLowerCase() === values.name.trim().toLowerCase(),
    );

    if (placeExists) {
      form.setError("name", {
        type: "manual",
        message: "A place with this name already exists",
      });
      return;
    }

    placesCollection.insert({
      id: crypto.randomUUID(),
      name: values.name.trim(),
      travel: travelId,
    });

    setIsOpen(false);
    form.reset();
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={() => form.reset()}>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New place
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex justify-between">
            <div>
              <DrawerTitle className="font-semibold text-lg text-foreground">
                Add a place
              </DrawerTitle>
              <DrawerDescription>Add a place to your travel.</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="size-5" />
              </Button>
            </DrawerClose>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Place name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the place.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="h-px bg-border" />

              <Button type="submit" className="w-full">
                Add place
              </Button>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

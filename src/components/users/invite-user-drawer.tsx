import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import { useState } from "react";

const formSchema = z.object({
  email: z.email("Email is required."),
});

export const InviteUserDrawer = ({ travelId }: { travelId: string }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const inviteUserMutation = useMutation(
    trpc.travels.inviteUser.mutationOptions(),
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    inviteUserMutation.mutate(
      { id: travelId, email: values.email },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
        onError: (error) => {
          form.setError("email", { message: error.message });
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">Invite someone</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex items-center gap-2">
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </DrawerClose>
            <DrawerTitle className="font-semibold text-lg text-foreground">
              Invite someone
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Add a new user to your travel.
            </DrawerDescription>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tom@travelbuddy.com"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="h-px bg-border" />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={inviteUserMutation.isPending}
              >
                {inviteUserMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Invite user"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, X, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";

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

  const { data: travel } = useQuery(
    trpc.travels.list.queryOptions(undefined, {
      select: (travels) => travels.find((t) => t.id === travelId),
    }),
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

  const copyToClipboard = () => {
    if (travel?.joinCode) {
      const url = `${window.location.origin}/travels/join?code=${travel.joinCode}`;
      navigator.clipboard.writeText(url);
      toast.success("Join link copied to clipboard!");
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">Invite someone</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex justify-between">
            <div>
              <DrawerTitle className="font-semibold text-lg text-foreground">
                Invite someone
              </DrawerTitle>
              <DrawerDescription>
                Add a new user to your travel.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="size-5" />
              </Button>
            </DrawerClose>
          </div>

          <div className="space-y-6 mt-6">
            {travel?.joinCode && (
              <>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Scan to join this travel
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <QRCodeSVG
                    value={`${window.location.origin}/travels/join?code=${travel.joinCode}`}
                    size={128}
                    className="p-2 bg-white"
                  />
                </div>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Share this link
                  </span>
                </div>

                <div className="p-3 bg-muted rounded-md flex items-center justify-between mt-2">
                  <span className="text-sm font-mono truncate">
                    {`${window.location.origin}/travels/join?code=${travel.joinCode}`}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                    <Copy className="size-4" />
                  </Button>
                </div>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Invite directly a user
                  </span>
                </div>
              </>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pb-10"
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
        </div>
      </DrawerContent>
    </Drawer>
  );
};

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/trpc/client";

const CONTACT_TYPES = ["feedback", "help", "bug"];

const formSchema = z.object({
  type: z.enum(CONTACT_TYPES),
  message: z.string("Message is required.").min(1, "Message is required."),
});

export const ContactDrawer = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "help",
    },
  });

  const sendMessageMutation = useMutation(
    trpc.misc.sendMessage.mutationOptions({
      onSuccess() {
        toast("Message successfully sent! Thanks for your message.");

        onOpenChange(false);
        form.reset();
      },
    }),
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    sendMessageMutation.mutate(values);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex justify-between">
            <div>
              <DrawerTitle className="font-semibold text-lg text-foreground">
                Send a message to the developer
              </DrawerTitle>
              <DrawerDescription>
                You can contact me (Tracktrip's developer) using this form.
              </DrawerDescription>
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
              className="space-y-4 my-10"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger className="capitalize">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTACT_TYPES.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your message"
                        {...field}
                        className="min-h-40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="h-px bg-border my-8" />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <>
                    <Send />
                    Send
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

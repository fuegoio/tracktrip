import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/user-menu";
import { trpc } from "@/trpc/client";

const formSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export const Route = createFileRoute("/_authenticated/travels/join")({
  component: JoinTravelPage,
  validateSearch: (search) => {
    return z.object({ code: z.string().optional() }).parse(search);
  },
});

function JoinTravelPage() {
  const { session } = Route.useRouteContext();
  const { code } = Route.useSearch();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: code || "",
    },
  });

  const joinMutation = useMutation(trpc.travels.joinByCode.mutationOptions());

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    joinMutation.mutate(values, {
      onSuccess: () => {
        setSuccess(true);
        setError(null);
        toast.success("Successfully joined the travel!");
        // Redirect to travels page after successful join
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      },
      onError: (error) => {
        setSuccess(false);
        setError(error.message);
        form.setError("code", { message: error.message });
      },
    });
  };

  // Auto-submit if code is in URL
  useEffect(() => {
    if (code) {
      form.setValue("code", code);
      form.handleSubmit(onSubmit)();
    }
  }, [code]);

  return (
    <div className="p-6 space-y-6">
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

      <h1 className="text-2xl font-bold">Join a Travel</h1>

      {success ? (
        <div className="p-4 bg-green-100 text-green-800 rounded-md flex items-center space-x-2">
          <CheckCircle2 className="size-5" />
          <span>Successfully joined the travel! Redirecting...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-md flex items-center space-x-2">
          <AlertCircle className="size-5" />
          <span>{error}</span>
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter travel code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={joinMutation.isPending || success}>
            {joinMutation.isPending
              ? "Joining..."
              : success
                ? "Joined!"
                : "Join Travel"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

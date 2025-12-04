import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import z from "zod";

import { authClient } from "@/auth/client";
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

const searchParamsSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/request-password-reset")({
  component: RouteComponent,
  validateSearch: searchParamsSchema,
  loader: async () => {
    const res = await authClient.getSession();
    if (res.data) {
      throw redirect({
        to: "/travels",
      });
    }
    return null;
  },
});

const formSchema = z.object({
  email: z.string("Email is required.").min(1, "Email is required."),
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email }: z.infer<typeof formSchema>) => {
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: window.location.origin + "/reset-password",
    });

    if (error) {
      form.setError("email", {
        message: error.message,
      });
    } else {
      setEmailSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="bg-background dark h-full w-full flex items-center justify-center">
      <div className="p-6 flex flex-col justify-center gap-6 h-full max-w-lg w-full">
        <div>
          <div className="size-6 rounded-full bg-white mb-2" />
          <h1 className="text-lg font-semibold mt-3 text-foreground">
            Reset your password
          </h1>
          <div className="text-sm text-muted-foreground mt-1">
            Please enter your email address to request a password reset.
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!emailSent && (
            <motion.div key="form" exit={{ opacity: 0 }}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Request password reset"
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/signup"
                      className="underline underline-offset-4"
                      search={{ redirect }}
                    >
                      Sign up
                    </Link>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {emailSent && (
            <motion.div
              key="email-sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 border-t pt-4"
            >
              <div className="text-foreground">
                We sent you an email with a link to reset your password.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

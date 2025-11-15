import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  token: z.string(),
});

export const Route = createFileRoute("/reset-password")({
  component: RouteComponent,
  validateSearch: searchParamsSchema,
});

const formSchema = z.object({
  password: z.string("Password is required.").min(1, "Password is required."),
});

function RouteComponent() {
  const { token } = Route.useSearch();
  const [passwordReset, setPasswordReset] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ password }: z.infer<typeof formSchema>) => {
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      form.setError("password", {
        message: error.message,
      });
    } else {
      setPasswordReset(true);
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
            Enter your new password below.
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!passwordReset && (
            <motion.div key="form" exit={{ opacity: 0 }}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {passwordReset && (
            <motion.div
              key="password-reset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 border-t pt-4"
            >
              <div className="text-foreground">
                Password updated successfully.
              </div>

              <Button className="w-full" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

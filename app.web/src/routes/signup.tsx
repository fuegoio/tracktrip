import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import z from "zod";

import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchParamsSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/signup")({
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
  firstName: z
    .string("First name is required.")
    .min(1, "First name is required."),
  lastName: z.string("Last name is required.").min(1, "Last name is required."),
  email: z.string("Email is required.").min(1, "Email is required."),
  password: z.string("Password is required.").min(1, "Password is required."),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  const [needsVerify, setNeedsVerify] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      terms: false,
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async ({
    email,
    password,
    firstName,
    lastName,
  }: z.infer<typeof formSchema>) => {
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`,
      callbackURL: redirect || "/travels",
    });

    if (error) {
      form.setError("password", {
        message: error.message,
      });
    } else {
      setNeedsVerify(true);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
    });
    setLoading(false);
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "apple",
    });
    setLoading(false);
  };

  return (
    <div className="bg-background dark h-full w-full flex items-center justify-center">
      <div className="p-6 flex flex-col justify-center gap-6 h-full max-w-lg w-full">
        <div>
          <div className="size-6 rounded-full bg-white mb-2" />
          <h1 className="text-lg font-semibold mt-3 text-foreground">
            Create an account
          </h1>
          <div className="text-sm text-muted-foreground mt-1">
            Welcome! Create an account to get started.
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!needsVerify && (
            <motion.div
              key="signup-form"
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={loading}
                onClick={handleGoogleLogin}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Sign up with Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={loading}
                onClick={handleAppleLogin}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000">
                  <path
                    d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
                    fill="currentColor"
                  />
                </svg>
                Sign up with Apple
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or
                </span>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="terms"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-invalid={fieldState.invalid}
                            />
                            <Label htmlFor="terms" className="text-sm">
                              I agree to the{" "}
                              <a
                                href="#"
                                className="underline underline-offset-4"
                              >
                                Terms and Conditions
                              </a>
                            </Label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Create account"
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="underline underline-offset-4"
                      search={{ redirect }}
                    >
                      Login
                    </Link>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {needsVerify && (
            <motion.div
              key="verify-email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 border-t pt-4"
            >
              <div className="text-foreground">
                We sent you an email with a link to verify your email address.
                Please check your inbox and click the link to verify your email.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

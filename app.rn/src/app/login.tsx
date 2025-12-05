import React, { useState } from "react";
import Svg, { Path } from "react-native-svg";
import { TextInput, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/auth/client";
import { Text } from "@/components/ui/text";
import { LoaderCircle } from "lucide-react-native";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.email("Email is required.").min(1, "Email is required."),
  password: z.string("Password is required.").min(1, "Password is required."),
});

const LoginScreen = () => {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const passwordInputRef = React.useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: redirect || "/travels",
      });

      if (error) {
        setError("password", {
          message: error.message,
        });
      } else {
        router.navigate(redirect || "/travels");
      }
    } catch (error) {
      setError("password", {
        message: "Unable to login. Please try again later.",
      });
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: redirect || "/travels",
    });
    setLoading(false);
  };

  return (
    <View className="dark h-full w-full flex-1 items-center justify-center bg-background p-6">
      <View className="w-full max-w-md">
        <View className="mb-6">
          <View className="size-6 rounded-full bg-white" />
          <Text className="mt-3 text-lg font-semibold text-foreground">
            Sign in to Tracktrip
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Welcome back! Please enter your details.
          </Text>
        </View>

        <View className="w-full gap-5">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <View className="gap-2">
                <Label className="text-sm font-medium" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  autoCapitalize="none"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                  onSubmitEditing={() => {
                    passwordInputRef.current?.focus();
                  }}
                />
                {errors.email && (
                  <Text className="mt-1 text-sm text-destructive">
                    {errors.email.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/request-password-reset"
                    className="text-sm text-muted-foreground underline"
                  >
                    Forgot password?
                  </Link>
                </View>
                <Input
                  id="password"
                  ref={passwordInputRef}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  returnKeyType="send"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
                {errors.password && (
                  <Text className="mt-1 text-sm text-destructive">
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Text>Login</Text>
            )}
          </Button>

          <View className="items-center">
            <View className="absolute inset-0 top-1/2 border-t border-border" />
            <Text className="relative z-10 bg-background px-2 text-center text-sm text-muted-foreground">
              Or continue with
            </Text>
          </View>

          <Button
            variant="outline"
            onPress={handleGoogleLogin}
            disabled={loading}
            className="w-full"
          >
            <Svg viewBox="0 0 24 24" width={20} height={20} className="mr-1">
              <Path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="white"
              />
            </Svg>
            <Text>Login with Google</Text>
          </Button>

          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

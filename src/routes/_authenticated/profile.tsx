import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Edit } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { setCachedSession } from "@/auth/cache";
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
import { UserAvatar } from "@/components/users/user-avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  component: RouteComponent,
});

const formSchema = z.object({
  name: z.string("Name is required.").min(1, "Name is required."),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RouteComponent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const { session } = Route.useRouteContext();
  const [user, setUser] = useState(session.user);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      try {
        const imageData = await processImage(selectedFile);
        await authClient.updateUser({
          image: imageData,
        });
        setUser({ ...user, image: imageData });
        setCachedSession({ ...session, user: { ...user, image: imageData } });
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Error processing image");
        return;
      }
    }
  };

  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not get canvas context"));

        // Set canvas size to 128x128
        canvas.width = 128;
        canvas.height = 128;

        // Calculate cropping parameters
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Draw the cropped and resized image
        ctx.drawImage(img, x, y, size, size, 0, 0, 128, 128);

        // Convert to base64
        const base64 = canvas.toDataURL("image/jpeg");
        resolve(base64);
      };
      img.onerror = reject;
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await authClient.updateUser({
      name: values.name,
    });

    setUser({ ...user, name: values.name });
    setCachedSession({ ...session, user: { ...user, name: values.name } });

    toast.success("Profile updated successfully");
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const { error } = await authClient.changePassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to update password");
        return;
      }

      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Error updating password");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="w-full flex items-center justify-between px-4 py-3 dark text-foreground">
        <Button size="icon" variant="ghost" asChild>
          <Link to="/travels">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="font-medium">Account</div>

        <div className="size-8" />
      </div>

      <div className="flex flex-col items-center gap-3 px-6 py-6">
        <div className="relative">
          <UserAvatar user={user} className="size-20" />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full absolute -bottom-2 -right-2"
            onClick={() => imageInputRef.current?.click()}
          >
            <Edit className="size-4" />
          </Button>
          <input
            id="image"
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="flex flex-col items-center dark">
          <h3 className="text-xl font-semibold text-foreground">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-t-lg bg-background p-6 flex-1 shadow-up">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>

        <div className="border-t pt-4">
          <div className="font-semibold text-foreground text-base">
            Password
          </div>

          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/auth/client";
import { ArrowLeft, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setCachedSession } from "@/auth/cache";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const Route = createFileRoute("/_authenticated/profile")({
  component: RouteComponent,
});

const formSchema = z.object({
  name: z.string("Name is required.").min(1, "Name is required."),
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await authClient.updateUser({
      name: values.name,
    });

    setUser({ ...user, name: values.name });
    setCachedSession({ ...session, user: { ...user, name: values.name } });

    toast.success("Profile updated successfully");
  };

  return (
    <>
      <div className="w-full flex items-center justify-between px-4 py-3 border-b-border/50 border-b bg-background">
        <Button size="icon" variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="size-5 text-subtle-foreground" />
          </Link>
        </Button>

        <div className="font-medium">Account</div>

        <div className="size-8" />
      </div>

      <div className="px-6 py-6 space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="size-[72px]">
              <AvatarImage src={user.image ?? ""} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
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
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

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
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}


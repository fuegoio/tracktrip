import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesCollection } from "@/store/collections";
import {
  CategoryTypes,
  categoryTypeToColor,
  categoryTypeToDefaultName,
  categoryTypeToEmoji,
  type CategoryType,
} from "@/data/categories";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "../ui/emoji-picker";
import { useState } from "react";

const formSchema = z.object({
  name: z.string("Name is required.").min(1, "Name is required."),
  type: z.enum(CategoryTypes),
  emoji: z.string("Emoji is required.").min(1, "Emoji is required."),
  color: z.string("Color is required.").min(1, "Color is required."),
});

export const NewCategoryDrawer = ({ travelId }: { travelId: string }) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "food",
      color: categoryTypeToColor["food"],
      emoji: categoryTypeToEmoji["food"],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    categoriesCollection.insert({
      id: crypto.randomUUID(),
      ...values,
      travel: travelId,
    });

    form.reset();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">New category</Button>
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
              Add a category
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Add a category to your travel.
            </DrawerDescription>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={(value: CategoryType) => {
                        field.onChange(value);
                        form.setValue("color", categoryTypeToColor[value]);
                        form.setValue("emoji", categoryTypeToEmoji[value]);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger size="lg">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CategoryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {categoryTypeToEmoji[type]}{" "}
                            <span className="capitalize">{type}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      A category type is useful to display more relevant
                      insights about your expenses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-start gap-2 w-full">
                <FormField
                  control={form.control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Popover
                          open={isEmojiPickerOpen}
                          onOpenChange={setIsEmojiPickerOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              data-empty={!field.value}
                              className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal h-10"
                            >
                              {field.value}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-fit p-0">
                            <EmojiPicker
                              className="h-[342px]"
                              onEmojiSelect={({ emoji }) => {
                                field.onChange(emoji);
                                setIsEmojiPickerOpen(false);
                              }}
                            >
                              <EmojiPickerSearch />
                              <EmojiPickerContent />
                              <EmojiPickerFooter />
                            </EmojiPicker>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="opacity-0">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            categoryTypeToDefaultName[form.watch("type")]
                          }
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-border" />

              <DrawerClose asChild>
                <Button type="submit" className="w-full" size="lg">
                  Add category
                </Button>
              </DrawerClose>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

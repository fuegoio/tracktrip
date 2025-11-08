import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
} from "@/components/ui/emoji-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { travelsCollection } from "@/store/collections";

export const Route = createFileRoute("/_authenticated/travels/new")({
  component: NewTravel,
});

const formSchema = z
  .object({
    name: z.string("Name is required.").min(1, "Name is required."),
    emoji: z.string(),
    currency: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date.",
    path: ["endDate"], // This will attach the error to the endDate field
  });

function NewTravel() {
  const navigate = useNavigate({ from: "/travels/new" });
  const { session } = Route.useRouteContext();

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emoji: "🚄",
      currency: "EUR",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const id = crypto.randomUUID();
    travelsCollection.insert({
      id,
      ...values,
      users: [
        {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? null,
          role: "owner",
        },
      ],
    });
    navigate({ to: "/travels/$travelId", params: { travelId: id } });
  };

  const supportedCurrencies = Intl.supportedValuesOf("currency");

  return (
    <div className="flex flex-col h-full">
      <div className="dark p-4">
        <div className="flex items-center -mx-2">
          <Button className="px-2.5!" variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </Link>
          </Button>
        </div>
        <h1 className="text-4xl mt-8 text-foreground">Start a new travel</h1>
        <h2 className=""></h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-10 bg-background p-4 rounded-t-2xl flex-1"
        >
          <div>
            <div className="text-sm font-semibold text-foreground">
              Travel information
            </div>
            <div className="text-xs text-subtle-foreground">
              You will be able to change this later if needed.
            </div>
          </div>

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
                          variant="secondary"
                          data-empty={!field.value}
                          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal rounded-md h-10"
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
                    <Input placeholder="Europe by train" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Popover
                    open={isStartDatePickerOpen}
                    onOpenChange={setIsStartDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal rounded-md h-10"
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsStartDatePickerOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End date</FormLabel>
                <FormControl>
                  <Popover
                    open={isEndDatePickerOpen}
                    onOpenChange={setIsEndDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal rounded-md h-10"
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsEndDatePickerOpen(false);
                        }}
                        disabled={(date) => date < form.getValues("startDate")}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportedCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">
              Start travel
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

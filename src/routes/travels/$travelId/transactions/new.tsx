import { Button } from "@/components/ui/button";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionsCollection, usersCollection } from "@/store/collections";
import { useTravel } from "@/lib/params";
import { eq, useLiveQuery } from "@tanstack/react-db";
import {
  firstPartyCategories,
  firstPartyCategoriesEmoji,
} from "@/data/categories";

export const Route = createFileRoute("/travels/$travelId/transactions/new")({
  component: NewTransaction,
});

const formSchema = z.object({
  title: z.string("Name is required.").min(1, "Name is required."),
  description: z.string().optional(),
  date: z.date(),
  user: z.uuid(),
  amount: z.number(),
  currency: z.string(),
  place: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  days: z.number(),
});

function NewTransaction() {
  const params = Route.useParams();
  const navigate = useNavigate({ from: "/travels/$travelId/transactions/new" });
  const travel = useTravel({ id: params.travelId });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      currency: "EUR",
      days: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    transactionsCollection.insert({
      id: crypto.randomUUID(),
      ...values,
      travel: travel.id,
      date: values.date.toJSON(),
    });
    navigate({ to: "/" });
  };

  const supportedCurrencies = Intl.supportedValuesOf("currency");

  const users = useLiveQuery((q) =>
    q
      .from({ users: usersCollection })
      .where(({ users }) => eq(users.travel, travel.id)),
  );

  return (
    <div className="p-4">
      <div className="flex items-center -mx-2">
        <Button className="px-2.5!" variant="ghost" asChild>
          <Link to="/travels/$travelId" params={{ travelId: travel.id }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <h1 className="font-light text-4xl mt-8 text-slate-900">
        What did you do?
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-10"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Restaurant" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="A great place"
                    {...field}
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
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
                          setIsDatePickerOpen(false);
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
            name="amount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    placeholder="12.99"
                    {...field}
                    type="number"
                    className="h-10"
                  />
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

          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
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
                    {users.data.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
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
                    {firstPartyCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {firstPartyCategoriesEmoji[category]}{" "}
                        <span className="capitalize">{category}</span>
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
              Add transaction
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

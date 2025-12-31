export type Travel = {
  id: string;
  name: string;
  emoji: string;
  currency: string;
  startDate: Date;
  endDate: Date;
  users: TravelUser[];
  joinCode?: string;
  currencyRates: CurrencyRate[];
};

export type CurrencyRate = {
  currency: string;
  rate: number;
};

export type TravelUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "owner" | "member";
};

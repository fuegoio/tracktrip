export type Travel = {
  id: string;
  name: string;
  emoji: string;
  currency: string;
  startDate: Date;
  endDate: Date;
  users: TravelUser[];
};

export type TravelUser = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
};

import type { CategoryType } from "./categories";

export type BudgetPreset = Record<CategoryType, number> & {
  name: string;
};

export const BudgetsPresets: BudgetPreset[] = [
  {
    name: "Europe",
    food: 30,
    transport: 20,
    accommodation: 70,
    activity: 40,
    other: 10,
  },
  {
    name: "Asia",
    food: 20,
    transport: 15,
    accommodation: 50,
    activity: 30,
    other: 10,
  },
  {
    name: "North America",
    food: 30,
    transport: 25,
    accommodation: 60,
    activity: 40,
    other: 10,
  },
  {
    name: "South America",
    food: 25,
    transport: 20,
    accommodation: 55,
    activity: 35,
    other: 10,
  },
  {
    name: "Australia",
    food: 35,
    transport: 25,
    accommodation: 70,
    activity: 40,
    other: 10,
  },
  {
    name: "Africa",
    food: 20,
    transport: 15,
    accommodation: 50,
    activity: 30,
    other: 10,
  },
];

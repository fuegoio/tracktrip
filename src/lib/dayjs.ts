import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export function getIntervalsBetweenDates(
  startDate: Dayjs,
  endDate: Dayjs,
  period: "week" | "day" = "week",
) {
  const weeks: string[] = [];
  let currentDate = dayjs(startDate);
  const end = dayjs(endDate);

  while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
    const week = currentDate.startOf(period).format("YYYY-MM-DD");
    if (!weeks.includes(week)) {
      weeks.push(week);
    }
    currentDate = currentDate.add(1, "day");
  }

  return weeks;
}

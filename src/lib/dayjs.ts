import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export function getWeeksBetweenDates(startDate: Dayjs, endDate: Dayjs) {
  const weeks: string[] = [];
  let currentDate = dayjs(startDate);
  const end = dayjs(endDate);

  while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
    const week = currentDate.startOf("week").format("YYYY-MM-DD");
    if (!weeks.includes(week)) {
      weeks.push(week);
    }
    currentDate = currentDate.add(1, "day");
  }

  return weeks;
}

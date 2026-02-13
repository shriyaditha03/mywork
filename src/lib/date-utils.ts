import { format } from 'date-fns';

/**
 * IST is UTC + 5:30
 */
const IST_OFFSET_MINUTES = 330;

/**
 * Gets the current date/time adjusted to IST, regardless of the browser's local timezone.
 */
export const getNowIST = (): Date => {
    const now = new Date();
    // We calculate the UTC time, then add 5:30 hours
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (IST_OFFSET_MINUTES * 60000));
};

/**
 * Converts any date UTC/Local to an IST Date object for formatting/comparison.
 */
export const toIST = (date: Date | string | number): Date => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date();

    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (IST_OFFSET_MINUTES * 60000));
};

/**
 * Formats a date in IST with Indian standard dd-MM-yyyy.
 */
export const formatIST = (date: Date | string | number, pattern: string = 'dd-MM-yyyy'): string => {
    return format(toIST(date), pattern);
};

/**
 * Gets today's date string in IST (yyyy-MM-dd) for database/input filtering.
 */
export const getTodayISTStr = (): string => {
    return format(getNowIST(), 'yyyy-MM-dd');
};

/**
 * Checks if a given timestamp falls on the "Today" according to IST.
 */
export const isTodayIST = (timestamp: string | Date): boolean => {
    const today = getTodayISTStr();
    const target = format(toIST(timestamp), 'yyyy-MM-dd');
    return today === target;
};

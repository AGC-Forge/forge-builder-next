"use client";

import * as React from "react";
import { format, startOfDay, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TimestamptzRange = { from?: string; to?: string };

interface DateRangePickerProps {
  value?: TimestamptzRange;
  defaultValue?: TimestamptzRange;
  label?: string;
  onChange?: (value: TimestamptzRange | undefined) => void;
}

function parseTimestamptz(value: string | undefined) {
  if (!value) return undefined;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const d = new Date(year, month - 1, day, 0, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatTimestamptz(date: Date | undefined) {
  if (!date) return undefined;
  return startOfDay(date).toISOString();
}

function toDateRange(
  value: TimestamptzRange | undefined,
): DateRange | undefined {
  if (!value) return undefined;
  const from = parseTimestamptz(value.from);
  const to = parseTimestamptz(value.to);
  if (!from && !to) return undefined;
  return { from, to };
}

function toTimestamptzRange(
  range: DateRange | undefined,
): TimestamptzRange | undefined {
  if (!range) return undefined;
  const from = formatTimestamptz(range.from);
  const to = formatTimestamptz(range.to);
  if (!from && !to) return undefined;
  return { from, to };
}

export function DateRangePickerInput({
  value,
  defaultValue,
  label = "Date Picker Range",
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<
    TimestamptzRange | undefined
  >(() => {
    if (defaultValue) return defaultValue;
    const to = new Date();
    const from = subDays(to, 29);
    return {
      from: formatTimestamptz(from),
      to: formatTimestamptz(to),
    };
  });

  const currentValue = value ?? internalValue;
  const dateRange = React.useMemo(
    () => toDateRange(currentValue),
    [currentValue],
  );

  const handleDateChange = (nextValue: DateRange | undefined) => {
    const nextRange = toTimestamptzRange(nextValue);

    if (value === undefined) {
      setInternalValue(nextRange);
    }
    onChange?.(nextRange);
  };

  return (
    <Field className="mx-auto w-60">
      <FieldLabel htmlFor="date-picker-range">{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon />
            {dateRange?.from ? (
              dateRange.to ? (
                `${format(dateRange.from, "d MMM yyyy")} - ${format(dateRange.to, "d MMM yyyy")}`
              ) : (
                format(dateRange.from, "d MMM yyyy")
              )
            ) : (
              <span>Select date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

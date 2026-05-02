"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  defaultValue?: string;
  label?: string;
  onChange?: (value: string | undefined) => void;
}

function toLocalStartOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

function formatTimestamptz(date: Date | undefined) {
  if (!date) return undefined;
  return date.toISOString();
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

export function DatePickerInput({
  value,
  defaultValue,
  label,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue,
  );

  const currentValue = value ?? internalValue;
  const selectedDate = React.useMemo(
    () => parseTimestamptz(currentValue),
    [currentValue],
  );
  const [month, setMonth] = React.useState<Date | undefined>(selectedDate);

  const handleValueChange = (nextValue: string | undefined) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <Field className="mx-auto w-48">
      <FieldLabel htmlFor="date-required">{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={currentValue ?? ""}
          placeholder="YYYY-MM-DDTHH:mm:ss.SSSZ"
          onChange={(e) => {
            const nextText = e.target.value;
            handleValueChange(nextText === "" ? undefined : nextText);

            const nextDate = parseTimestamptz(nextText);
            if (nextDate) setMonth(nextDate);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id="date-picker"
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
              >
                <CalendarIcon />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                month={month ?? selectedDate}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  const nextDate = date ? toLocalStartOfDay(date) : undefined;
                  handleValueChange(formatTimestamptz(nextDate));
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

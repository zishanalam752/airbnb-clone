"use client";

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(day: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = day.getTime();
  return t > start.getTime() && t < end.getTime();
}

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed
  startDate: string;
  endDate: string;
  hoverDate: Date | null;
  today: Date;
  onSelectDay: (d: Date) => void;
  onHoverDay: (d: Date | null) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({
  year, month, startDate, endDate, hoverDate, today, onSelectDay, onHoverDay,
}) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // The visual end for range highlight: use hoverDate if no endDate yet
  const rangeEnd = end ?? hoverDate;

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="select-none">
      <p className="text-center font-semibold text-sm mb-3 text-zinc-900 dark:text-zinc-100">
        {MONTHS[month]} {year}
      </p>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-zinc-400 py-1">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dayStr = toDateStr(day);
          const isPast = day < today && !isSameDay(day, today);
          const isStart = start && isSameDay(day, start);
          const isEnd = end && isSameDay(day, end);
          const isSelected = isStart || isEnd;
          const inRange = start && rangeEnd && (
            isEnd
              ? false
              : isBetween(day, start, rangeEnd)
          );
          const isHoverEnd = !end && hoverDate && start && isSameDay(day, hoverDate) && day > start;
          const isToday = isSameDay(day, today);

          let cellClass =
            "relative flex items-center justify-center text-xs h-9 cursor-pointer transition-all duration-150 ";

          // Range highlight strip (between start and end/hover)
          let stripClass = "absolute inset-y-0 inset-x-0 ";
          let showStrip = false;

          if (inRange) {
            showStrip = true;
            stripClass += "bg-rose-50 dark:bg-rose-950/30 ";
          }

          // Round left edge on start date, right edge on end/hover date
          if (isStart && (end || hoverDate)) {
            showStrip = true;
            stripClass += "bg-rose-50 dark:bg-rose-950/30 rounded-l-full left-1/2 ";
          }
          if ((isEnd || isHoverEnd) && start) {
            showStrip = true;
            stripClass += "bg-rose-50 dark:bg-rose-950/30 rounded-r-full right-1/2 ";
          }

          if (isSelected || isHoverEnd) {
            cellClass += "z-10 ";
          } else if (isPast) {
            cellClass += "text-zinc-300 dark:text-zinc-600 cursor-not-allowed ";
          } else {
            cellClass += "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full ";
          }

          return (
            <div
              key={dayStr}
              className={cellClass}
              onClick={() => !isPast && onSelectDay(day)}
              onMouseEnter={() => !isPast && onHoverDay(day)}
              onMouseLeave={() => onHoverDay(null)}
            >
              {showStrip && <span className={stripClass} />}
              <span
                className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors
                  ${isSelected || isHoverEnd
                    ? "bg-rose-500 text-white font-bold shadow-md"
                    : isToday && !isPast
                    ? "border border-rose-400 text-rose-500 font-semibold"
                    : ""
                  }`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CalendarPickerProps {
  startDate: string;           // "YYYY-MM-DD" or ""
  endDate: string;             // "YYYY-MM-DD" or ""
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  /** If true, renders two months side by side (for larger modals). Default: true */
  twoMonths?: boolean;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  startDate, endDate, onStartDateChange, onEndDateChange, twoMonths = true,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(() => {
    const d = parseDate(startDate);
    return d ? d.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDate(startDate);
    return d ? d.getMonth() : today.getMonth();
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleSelectDay = useCallback((day: Date) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // If nothing selected yet, or both already selected → set new start
    if (!start || (start && end)) {
      onStartDateChange(toDateStr(day));
      onEndDateChange("");
      return;
    }
    // Start is set but no end
    if (day > start) {
      onEndDateChange(toDateStr(day));
    } else if (isSameDay(day, start)) {
      // clicking start again → reset
      onStartDateChange("");
      onEndDateChange("");
    } else {
      // picked before start → new start
      onStartDateChange(toDateStr(day));
      onEndDateChange("");
    }
  }, [startDate, endDate, onStartDateChange, onEndDateChange]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl p-4">
      {/* Navigation row */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </button>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </button>
      </div>

      {/* Month grid(s) */}
      <div className={twoMonths ? "grid grid-cols-2 gap-6" : ""}>
        <MonthGrid
          year={viewYear}
          month={viewMonth}
          startDate={startDate}
          endDate={endDate}
          hoverDate={hoverDate}
          today={today}
          onSelectDay={handleSelectDay}
          onHoverDay={setHoverDate}
        />
        {twoMonths && (
          <MonthGrid
            year={secondYear}
            month={secondMonth}
            startDate={startDate}
            endDate={endDate}
            hoverDate={hoverDate}
            today={today}
            onSelectDay={handleSelectDay}
            onHoverDay={setHoverDate}
          />
        )}
      </div>

      {/* Status row */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {startDate
            ? `Check-in: ${startDate}`
            : <span className="italic">Select check-in date</span>}
        </span>
        <span>
          {endDate
            ? `Check-out: ${endDate}`
            : startDate
            ? <span className="italic text-rose-400">Now select check-out</span>
            : ""}
        </span>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => { onStartDateChange(""); onEndDateChange(""); }}
            className="text-rose-500 hover:underline font-medium"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarPicker;

package com.healbit.service;

import com.healbit.dto.MonthCount;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Small shared helpers for building dashboard time-series. */
public final class MetricsUtil {

    private MetricsUtil() {}

    /** Counts per month for the last {months} calendar months (oldest -> newest), always dense. */
    public static List<MonthCount> monthlyCounts(List<LocalDateTime> timestamps, int months) {
        YearMonth now = YearMonth.now();
        Map<YearMonth, Long> buckets = new LinkedHashMap<>();
        for (int i = months - 1; i >= 0; i--) {
            buckets.put(now.minusMonths(i), 0L);
        }
        if (timestamps != null) {
            for (LocalDateTime ts : timestamps) {
                if (ts == null) continue;
                YearMonth ym = YearMonth.from(ts.toLocalDate());
                if (buckets.containsKey(ym)) {
                    buckets.merge(ym, 1L, Long::sum);
                }
            }
        }
        List<MonthCount> out = new ArrayList<>();
        for (Map.Entry<YearMonth, Long> e : buckets.entrySet()) {
            String label = e.getKey().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + e.getKey().getYear();
            out.add(new MonthCount(label, e.getValue()));
        }
        return out;
    }

    public static boolean isToday(LocalDate date) {
        return date != null && date.equals(LocalDate.now());
    }
}

package com.healbit.dto;

// A single point on a monthly time-series, e.g. { "Jan 2026", 12 }.
public class MonthCount {
    private String month;
    private long count;

    public MonthCount() {}
    public MonthCount(String month, long count) {
        this.month = month;
        this.count = count;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}

package com.healbit.service;

import com.healbit.dto.BreakPeriod;
import com.healbit.entity.Doctor;
import com.healbit.entity.DoctorStatus;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Shared helpers for per-doctor appointment slots and weekly schedules. */
public final class ScheduleUtil {

    public static final int SLOT_MINUTES = 30;

    private static final String[] TOKENS = { "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN" };

    private ScheduleUtil() {}

    public static String dayToken(DayOfWeek day) {
        return TOKENS[day.getValue() - 1]; // DayOfWeek: MONDAY=1 ... SUNDAY=7
    }

    /** Parse a stored CSV like "MON,TUE,WED" into an ordered set of DayOfWeek. */
    public static Set<DayOfWeek> parseWorkingDays(String csv) {
        Set<DayOfWeek> days = new LinkedHashSet<>();
        if (!StringUtils.hasText(csv)) return days;
        for (String raw : csv.split(",")) {
            String t = raw.trim().toUpperCase();
            for (int i = 0; i < TOKENS.length; i++) {
                if (TOKENS[i].equals(t)) days.add(DayOfWeek.of(i + 1));
            }
        }
        return days;
    }

    /** Normalise a list of day tokens from the client into a clean stored CSV. */
    public static String toWorkingDaysCsv(List<String> input) {
        if (input == null || input.isEmpty()) return "";
        List<String> ordered = new ArrayList<>();
        for (String token : TOKENS) {
            for (String raw : input) {
                if (raw != null && token.equalsIgnoreCase(raw.trim()) && !ordered.contains(token)) {
                    ordered.add(token);
                }
            }
        }
        return String.join(",", ordered);
    }

    public static List<String> workingDaysList(String csv) {
        List<String> out = new ArrayList<>();
        if (!StringUtils.hasText(csv)) return out;
        for (String raw : csv.split(",")) {
            String t = raw.trim().toUpperCase();
            if (Arrays.asList(TOKENS).contains(t)) out.add(t);
        }
        return out;
    }

    /** All 30-minute slot start times within [start, end). Last slot ends at or before end. */
    public static List<LocalTime> generateSlots(LocalTime start, LocalTime end) {
        return generateSlots(start, end, null, SLOT_MINUTES);
    }

    /**
     * All 30-minute slot start times within [start, end), skipping any break windows.
     *
     * Unlike a naive "drop any 30-minute slot that touches a break" approach, this walks the
     * working window in order and, whenever the next candidate slot would overlap a break,
     * jumps straight to that break's end time rather than to the next fixed 30-minute mark.
     * That means the very next appointment slot always starts immediately once the break is
     * over (e.g. a 10-minute break no longer wastes 20 extra minutes waiting for the next
     * :00/:30 boundary), and every later slot that day naturally shifts to follow on from there.
     * Break length is whatever the doctor configured (start/end), so this works for breaks of
     * any configurable duration, not just 30-minute multiples.
     */
    public static List<LocalTime> generateSlots(LocalTime start, LocalTime end, List<BreakPeriod> breaks) {
        return generateSlots(start, end, breaks, SLOT_MINUTES);
    }

    public static List<LocalTime> generateSlots(LocalTime start, LocalTime end, List<BreakPeriod> breaks, Integer slotMinutes) {
        List<LocalTime> slots = new ArrayList<>();
        if (start == null || end == null || !start.isBefore(end)) return slots;
        int duration = slotMinutes == null ? SLOT_MINUTES : slotMinutes;
        if (duration < 5 || duration > 240) return slots;
        LocalTime t = start;
        while (!t.plusMinutes(duration).isAfter(end)) {
            LocalTime slotEnd = t.plusMinutes(duration);
            BreakPeriod overlapping = overlappingBreak(t, slotEnd, breaks);
            if (overlapping != null) {
                // Skip straight to the moment the break ends; don't add this slot.
                t = overlapping.getEndTime();
                continue;
            }
            slots.add(t);
            t = slotEnd;
        }
        return slots;
    }

    private static BreakPeriod overlappingBreak(LocalTime slotStart, LocalTime slotEnd, List<BreakPeriod> breaks) {
        if (breaks == null) return null;
        for (BreakPeriod b : breaks) {
            if (b.getStartTime() == null || b.getEndTime() == null) continue;
            if (slotStart.isBefore(b.getEndTime()) && b.getStartTime().isBefore(slotEnd)) return b;
        }
        return null;
    }

    /** True if the doctor has a usable weekly schedule configured. */
    public static boolean scheduleConfigured(Doctor d) {
        return StringUtils.hasText(d.getWorkingDays())
                && d.getStartTime() != null
                && d.getEndTime() != null
                && d.getStartTime().isBefore(d.getEndTime());
    }

    /**
     * Real-time presence status shown to patients/hospitals right now, based purely on the
     * doctor's configured working hours and break windows compared against the current moment:
     *
     *   1. No schedule configured, today isn't a working day, or the current time is before
     *      startTime / at-or-after endTime -> UNAVAILABLE.
     *   2. Within working hours but inside a configured break window            -> ON_BREAK.
     *   3. Within working hours and not on a break                             -> AVAILABLE.
     *
     * This is intentionally independent of whether the doctor has any bookable slots left today
     * or in the coming week (that's a separate, longer-horizon concept — see
     * DoctorService#computeAvailable, which backs the "Book appointment" button instead).
     */
    public static DoctorStatus computeCurrentStatus(Doctor doctor, java.time.LocalDate today, LocalTime now, List<BreakPeriod> breaks) {
        if (!scheduleConfigured(doctor)) return DoctorStatus.UNAVAILABLE;

        Set<DayOfWeek> days = parseWorkingDays(doctor.getWorkingDays());
        if (!days.contains(today.getDayOfWeek())) return DoctorStatus.UNAVAILABLE;

        if (now.isBefore(doctor.getStartTime()) || !now.isBefore(doctor.getEndTime())) {
            return DoctorStatus.UNAVAILABLE;
        }

        if (isWithinBreak(now, breaks)) return DoctorStatus.ON_BREAK;

        return DoctorStatus.AVAILABLE;
    }

    // ---------------- Break windows (lunch, recess, etc.) ----------------
    // Stored as "label|HH:mm|HH:mm;label|HH:mm|HH:mm" — a doctor may have multiple breaks.

    /** Serialise break periods from the client into a clean stored string. */
    public static String toBreaksString(List<BreakPeriod> input) {
        if (input == null || input.isEmpty()) return "";
        List<String> parts = new ArrayList<>();
        for (BreakPeriod b : input) {
            if (b == null || b.getStartTime() == null || b.getEndTime() == null) continue;
            if (!b.getStartTime().isBefore(b.getEndTime())) continue;
            String label = StringUtils.hasText(b.getLabel()) ? b.getLabel().trim().replace("|", "").replace(";", "") : "Break";
            parts.add(label + "|" + b.getStartTime() + "|" + b.getEndTime());
        }
        return String.join(";", parts);
    }

    /** Parse the stored break string back into a list of BreakPeriod, ordered by start time. */
    public static List<BreakPeriod> parseBreaks(String stored) {
        List<BreakPeriod> out = new ArrayList<>();
        if (!StringUtils.hasText(stored)) return out;
        for (String raw : stored.split(";")) {
            if (!StringUtils.hasText(raw)) continue;
            String[] parts = raw.split("\\|");
            if (parts.length != 3) continue;
            try {
                out.add(new BreakPeriod(parts[0], LocalTime.parse(parts[1]), LocalTime.parse(parts[2])));
            } catch (Exception ignored) {
                // skip malformed entries rather than fail the whole read
            }
        }
        out.sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));
        return out;
    }

    /** True if the given point in time falls within any of the supplied break windows. */
    public static boolean isWithinBreak(LocalTime time, List<BreakPeriod> breaks) {
        if (time == null || breaks == null) return false;
        for (BreakPeriod b : breaks) {
            if (b.getStartTime() == null || b.getEndTime() == null) continue;
            if (!time.isBefore(b.getStartTime()) && time.isBefore(b.getEndTime())) return true;
        }
        return false;
    }

    /** True if a 30-minute slot starting at slotStart overlaps any of the supplied break windows at all. */
    public static boolean slotOverlapsBreak(LocalTime slotStart, List<BreakPeriod> breaks) {
        if (slotStart == null || breaks == null) return false;
        LocalTime slotEnd = slotStart.plusMinutes(SLOT_MINUTES);
        for (BreakPeriod b : breaks) {
            if (b.getStartTime() == null || b.getEndTime() == null) continue;
            if (slotStart.isBefore(b.getEndTime()) && b.getStartTime().isBefore(slotEnd)) return true;
        }
        return false;
    }
}

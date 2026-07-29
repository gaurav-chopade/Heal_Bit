// Display tag for a doctor's availability.
//
// "Available" here means BOOKABLE — the doctor has a published schedule with at least one
// open 30-minute slot in the next 7 days (DoctorResponse.available), regardless of whether
// they happen to be within working hours at this exact moment. We only surface the real-time
// "On break" state (DoctorResponse.onBreakNow) because that's genuinely useful right now.
export function doctorStatusTag(doctor) {
  if (doctor?.onBreakNow) return { cls: "break", label: "On break" };
  if (doctor?.available) return { cls: "on", label: "Available" };
  return { cls: "off", label: "Unavailable" };
}

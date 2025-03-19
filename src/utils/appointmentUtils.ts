import { supabase } from "@/lib/supabase";

export async function isDateAvailable(
  date: string,
  doctorId: string
): Promise<{ available: boolean; reason?: string }> {
  try {
    // Check if the date is in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return {
        available: false,
        reason: "You cannot book an appointment for a past date",
      };
    }

    // Check if the date is too far in the future (e.g., more than 3 months)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    if (selectedDate > maxDate) {
      return {
        available: false,
        reason: "Appointments can only be booked up to 3 months in advance",
      };
    }

    // Check if the selected date is on a weekend
    const dayOfWeek = selectedDate.getDay();

    // Get doctor's schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", doctorId)
      .single();

    if (scheduleError) {
      console.error("Error fetching doctor schedule:", scheduleError);
      return { available: false, reason: "Unable to check doctor's schedule" };
    }

    // Check if doctor is on leave
    const isOnLeave = schedule?.leaves?.some(
      (leave: any) =>
        selectedDate >= new Date(leave.startDate) &&
        selectedDate <= new Date(leave.endDate)
    );

    if (isOnLeave) {
      return {
        available: false,
        reason: "The doctor is on leave on this date",
      };
    }

    // Check if the doctor works on this day
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dayOfWeek];

    const daySchedule = schedule?.weekly_schedule?.find(
      (day: any) => day.day === dayName
    );

    if (!daySchedule || daySchedule.status === "Closed") {
      return {
        available: false,
        reason: `The doctor doesn't work on ${dayName}s`,
      };
    }

    // Generate all possible time slots based on working hours and interval
    const workingStart = schedule?.working_hours?.start || "09:00";
    const workingEnd = schedule?.working_hours?.end || "17:00";
    const slotIntervalMinutes = 30; // Default 30 minutes per slot

    const totalPossibleSlots = generateTimeSlots(
      workingStart,
      workingEnd,
      slotIntervalMinutes
    );

    // Filter slots based on doctor's breaks
    const availableSlotsWithBreaks = totalPossibleSlots.filter((slot) => {
      // Check if the slot is during a break
      return !schedule?.breaks?.some((breakTime: any) => {
        const slotTime = new Date(`2000-01-01T${slot}`);
        const breakStart = new Date(`2000-01-01T${breakTime.start}`);
        const breakEnd = new Date(`2000-01-01T${breakTime.end}`);
        return slotTime >= breakStart && slotTime < breakEnd;
      });
    });

    // Check if there are any slots available on this date
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("time")
      .eq("date", date)
      .eq("doctor_id", doctorId)
      .not("status", "eq", "cancelled");

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      return { available: false, reason: "Unable to check availability" };
    }

    // Extract already booked times
    const bookedTimes =
      appointments?.map((appointment: any) => appointment.time) || [];

    // Filter out already booked slots
    const remainingAvailableSlots = availableSlotsWithBreaks.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    // If no slots are available
    if (remainingAvailableSlots.length === 0) {
      return { available: false, reason: "All slots are booked for this date" };
    }

    return { available: true };
  } catch (error) {
    console.error("Error checking date availability:", error);
    return {
      available: false,
      reason: "An error occurred while checking availability",
    };
  }
}

// Helper function to generate time slots
function generateTimeSlots(
  start: string,
  end: string,
  intervalMinutes: number
): string[] {
  const slots: string[] = [];
  const startTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);

  let current = new Date(startTime);

  while (current < endTime) {
    const hours = current.getHours().toString().padStart(2, "0");
    const minutes = current.getMinutes().toString().padStart(2, "0");
    slots.push(`${hours}:${minutes}`);

    current = new Date(current.getTime() + intervalMinutes * 60000);
  }

  return slots;
}

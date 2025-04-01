import { supabase } from "@/lib/supabase";
import { Appointment, BreakTime } from "@/types/database";

export const appointmentService = {
  async createAppointment(
    appointmentData: Omit<Appointment, "id" | "created_at">
  ) {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get available slots for a specific date and doctor
  getAvailableSlots: async (
    date: string,
    doctorId: string
  ): Promise<string[]> => {
    try {
      // Default time slots (9:00 AM to 5:00 PM with 30 minute intervals)
      const allTimeSlots = generateTimeSlots("09:00", "17:00", 30);

      // Fetch doctor's schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", doctorId)
        .single();

      if (scheduleError) {
        console.error("Error fetching doctor schedule:", scheduleError);
        return [];
      }

      // Check if the doctor is on leave
      const isOnLeave = scheduleData?.leaves?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (leave: any) =>
          new Date(date) >= new Date(leave.startDate) &&
          new Date(date) <= new Date(leave.endDate)
      );

      if (isOnLeave) {
        return []; // Doctor is on leave, no slots available
      }

      // Get day of week
      const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      // Check if doctor works on this day
      const daySchedule = scheduleData?.weekly_schedule?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (day: any) => day.day === dayOfWeek
      );

      if (
        !daySchedule ||
        daySchedule.status === "Closed" ||
        daySchedule.slots.length === 0
      ) {
        return []; // Doctor doesn't work on this day
      }

      // Fetch existing appointments for the date
      const { data: existingAppointments, error: appointmentsError } =
        await supabase
          .from("appointments")
          .select("time")
          .eq("date", date)
          .eq("doctor_id", doctorId)
          .not("status", "eq", "cancelled"); // Exclude cancelled appointments

      if (appointmentsError) {
        console.error(
          "Error fetching existing appointments:",
          appointmentsError
        );
        return [];
      }

      // Extract already booked times
      const bookedTimes =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        existingAppointments?.map((appointment: any) => appointment.time) || [];

      // Filter out already booked slots
      const availableSlots = allTimeSlots.filter(
        (slot) => !bookedTimes.includes(slot)
      );

      // Apply doctor's break times
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const availableSlotsWithBreaks = availableSlots.filter((slot) => {
        // Check if the slot is during a break
        return !scheduleData?.breaks?.some((breakTime: BreakTime) => {
          const slotTime = new Date(`2000-01-01T${slot}`);
          const breakStart = new Date(`2000-01-01T${breakTime.start}`);
          const breakEnd = new Date(`2000-01-01T${breakTime.end}`);
          return slotTime >= breakStart && slotTime < breakEnd;
        });
      });

      return availableSlotsWithBreaks;
    } catch (error) {
      console.error("Error getting available slots:", error);
      return [];
    }
  },
};

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

import { supabase } from "@/lib/supabase";

export const isDateAvailable = async (date: string, doctorId: string) => {
  try {
    // Get doctor's schedule and leaves
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", doctorId)
      .single();

    if (scheduleError) throw scheduleError;

    // Check if date falls within any leave period
    const isOnLeave = scheduleData.leaves.some((leave: any) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const checkDate = new Date(date);
      return checkDate >= leaveStart && checkDate <= leaveEnd;
    });

    if (isOnLeave) {
      return {
        available: false,
        reason: "Doctor is on leave on this date",
      };
    }

    // Check day of week and weekly schedule
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const daySchedule = scheduleData.weekly_schedule.find(
      (schedule: any) => schedule.day === dayOfWeek
    );

    if (
      !daySchedule ||
      daySchedule.status === "Closed" ||
      daySchedule.slots.length === 0
    ) {
      return {
        available: false,
        reason: `No appointments available on ${dayOfWeek}`,
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Error checking date availability:", error);
    throw error;
  }
};

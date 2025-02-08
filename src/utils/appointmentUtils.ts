import { supabase } from '@/lib/supabase';

export async function isDateAvailable(date: string, doctorId: string): Promise<{ available: boolean; reason?: string }> {
  try {
    // Get doctor's schedule including leaves
    const { data: schedule, error } = await supabase
      .from('doctor_schedules')
      .select('leaves')
      .eq('doctor_id', doctorId)
      .single();

    if (error) throw error;

    // Check if date is in leaves
    const isLeaveDay = schedule?.leaves?.some(
      (leave: { date: string }) => leave.date === date
    );

    if (isLeaveDay) {
      const leave = schedule.leaves.find((l: { date: string }) => l.date === date);
      return {
        available: false,
        reason: `Doctor is on leave${leave.reason ? ` (${leave.reason})` : ''}`
      };
    }

    return { available: true };
  } catch (error) {
    console.error('Error checking date availability:', error);
    throw error;
  }
}

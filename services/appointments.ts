import { supabase } from '../lib/supabase';
import { Appointment } from '../types/database';

export const appointmentService = {
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getAvailableSlots(date: string, doctorId: string) {
    // First, get all booked appointments for the date
    const { data: bookedSlots, error } = await supabase
      .from('appointments')
      .select('time')
      .eq('date', date)
      .eq('doctor_id', doctorId)
      .not('status', 'eq', 'cancelled');

    if (error) {
      throw new Error(error.message);
    }

    // Define all possible time slots (9 AM to 5 PM)
    const allSlots = [
      "09:00 AM", "10:00 AM", "11:00 AM", 
      "02:00 PM", "03:00 PM", "04:00 PM"
    ];

    // Filter out booked slots
    const bookedTimes = bookedSlots.map(slot => slot.time);
    return allSlots.filter(slot => !bookedTimes.includes(slot));
  }
};

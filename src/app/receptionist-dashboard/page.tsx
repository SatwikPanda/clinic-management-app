"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AppointmentStatus } from "@/types/database";
import { formatTime } from "@/utils/dateUtils";

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"today" | "upcoming" | "all">("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorSchedule, setDoctorSchedule] = useState<any>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [view]);

  useEffect(() => {
    fetchDoctorSchedule();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      let query = supabase.from("appointments").select(`
          *,
          patient:patient_id(name, phone, email),
          doctor:doctor_id(name)
        `);

      switch (view) {
        case "today":
          query = query.eq("date", today);
          break;
        case "upcoming":
          query = query.gt("date", today);
          break;
        // 'all' doesn't need any filter
      }

      const { data, error } = await query.order("date", { ascending: true });
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorSchedule = async () => {
    try {
      setScheduleLoading(true);
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (doctorData) {
        const { data: schedule } = await supabase
          .from('doctor_schedules')
          .select('*')
          .eq('doctor_id', doctorData.id)
          .single();

        setDoctorSchedule(schedule);
      }
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
    } finally {
      setScheduleLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: AppointmentStatus
  ) => {
    try {
      setLoading(true);

      // Update the appointment status in the database
      const { error } = await supabase
        .from("appointments")
        .update({ status: status })
        .match({ id: appointmentId });

      if (error) throw error;

      // After successful update, update the local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );

      // Show success message
      alert("Status updated successfully");
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update status");
    } finally {
      setLoading(false);
      // Refresh the appointments list to get the latest data
      fetchAppointments();
    }
  };

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient?.phone.includes(searchQuery) ||
      apt.confirmation_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-bold text-gray-900">
              Receptionist Dashboard
            </span>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/book-appointment"
                  className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  New Appointment
                </Link>
                <button
                  onClick={() => setView("today")}
                  className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View Today's Appointments
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Overview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Today's Appointments</p>
                  <p className="text-2xl font-semibold text-green-900">
                    {
                      appointments.filter(
                        (apt) =>
                          apt.date === new Date().toISOString().split("T")[0]
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Upcoming</p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {
                      appointments.filter(
                        (apt) => new Date(apt.date) > new Date()
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg col-span-2">
                  <p className="text-sm text-red-600">Emergency Appointments</p>
                  <p className="text-2xl font-semibold text-red-900">
                    {
                      appointments.filter(
                        (apt) => apt.type === "Emergency Service"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Appointments
                  </h2>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {(["today", "upcoming", "all"] as const).map(
                      (viewOption) => (
                        <button
                          key={viewOption}
                          onClick={() => setView(viewOption)}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            view === viewOption
                              ? "bg-white text-gray-900 shadow"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          {viewOption.charAt(0).toUpperCase() +
                            viewOption.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No appointments found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appointment.confirmation_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patient?.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.doctor?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={appointment.status}
                            onChange={(e) =>
                              updateAppointmentStatus(
                                appointment.id,
                                e.target.value as AppointmentStatus
                              )
                            }
                            className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Doctor's Schedule Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Doctor's Schedule
              </h2>
              {scheduleLoading ? (
                <p className="text-gray-500">Loading schedule...</p>
              ) : (
                <div className="space-y-4">
                  {/* Working Hours */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Working Hours</h3>
                    <p className="text-gray-600">
                      {doctorSchedule?.working_hours?.start || '09:00'} - {doctorSchedule?.working_hours?.end || '17:00'}
                    </p>
                  </div>

                  {/* Break Times */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Break Times</h3>
                    <div className="space-y-1">
                      {doctorSchedule?.breaks?.map((break_: any, index: number) => (
                        <div key={index} className="text-gray-600">
                          {break_.type}: {break_.start} - {break_.end}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Weekly Schedule</h3>
                    <div className="space-y-2">
                      {doctorSchedule?.weekly_schedule?.map((day: any) => (
                        <div key={day.day} className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="font-medium text-gray-700">{day.day}</span>
                          <div className="text-sm text-gray-600">
                            {day.slots.length > 0 ? (
                              day.slots.join(", ")
                            ) : (
                              <span className="text-red-500">{day.status || "Closed"}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Leave Schedule */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Doctor's Leave Schedule
              </h2>
              {scheduleLoading ? (
                <p className="text-gray-500">Loading leave schedule...</p>
              ) : doctorSchedule?.leaves?.length === 0 ? (
                <p className="text-gray-500">No upcoming leaves scheduled</p>
              ) : (
                <div className="space-y-4">
                  {doctorSchedule?.leaves?.map((leave: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{leave.reason}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Leave
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

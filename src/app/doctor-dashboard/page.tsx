"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Appointment } from '@/types/database';
import AppointmentDetailsModal from '@/components/AppointmentDetailsModal';
import NewAppointmentModal from '@/components/NewAppointmentModal';
import PatientDetailsModal from '@/components/PatientDetailsModal';
import NewPrescriptionModal from '@/components/NewPrescriptionModal';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';
import { useReactToPrint } from 'react-to-print';
import WorkingHoursModal from '@/components/WorkingHoursModal';
import BreakTimeModal from '@/components/BreakTimeModal';
import LeaveModal from '@/components/LeaveModal';
import EditScheduleModal from '@/components/EditScheduleModal';

export default function DoctorDashboard() {
  const [currentView, setCurrentView] = useState('appointments');
  const [appointmentFilter, setAppointmentFilter] = useState('today');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptionsList, setPrescriptionsList] = useState<any[]>([]);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [prescriptionSearchQuery, setPrescriptionSearchQuery] = useState('');
  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [showBreakTimeModal, setShowBreakTimeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        let query = supabase
          .from('appointments')
          .select(`
            *,
            patient:patient_id(name, phone),
            doctor:doctor_id(name)
          `);

        // Apply filters
        switch (appointmentFilter) {
          case 'today':
            query = query.eq('date', today);
            break;
          case 'upcoming':
            query = query.gt('date', today);
            break;
          case 'past':
            query = query.lt('date', today);
            break;
        }

        const { data, error } = await query.order('date', { ascending: appointmentFilter !== 'past' });

        if (error) throw error;
        setTodayAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentView === 'appointments') {
      fetchAppointments();
    }
  }, [currentView, appointmentFilter]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);
        let query = supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply search filter if query exists
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setPatientsLoading(false);
      }
    };

    if (currentView === 'patients') {
      fetchPatients();
    }
  }, [currentView, searchQuery]);

  const fetchPrescriptions = async () => {
    try {
      setPrescriptionsLoading(true);
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patient_id(name),
          medications(name, dosage, frequency)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptionsList(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [currentView]);

  const fetchSchedule = async () => {
    try {
      setScheduleLoading(true);
      
      // Get the single doctor
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id, name')
        .limit(1)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor:', doctorError);
        throw new Error('Failed to fetch doctor');
      }

      // Get or create schedule for the single doctor
      const { data: existingSchedule, error: scheduleError } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctor.id)
        .single();

      if (scheduleError && scheduleError.code !== 'PGRST116') {
        console.error('Error fetching schedule:', scheduleError);
        throw scheduleError;
      }

      if (!existingSchedule) {
        // Create default schedule
        const defaultSchedule = {
          doctor_id: doctor.id,
          working_hours: { start: '09:00', end: '17:00' },
          breaks: [{ start: '13:00', end: '14:00', type: 'Lunch Break' }],
          leaves: [],
          weekly_schedule: [
            { day: 'Monday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
            { day: 'Tuesday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
            { day: 'Wednesday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
            { day: 'Thursday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
            { day: 'Friday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
            { day: 'Saturday', slots: ['09:00 - 13:00'], status: 'Half Day' },
            { day: 'Sunday', slots: [], status: 'Closed' }
          ]
        };

        const { data: newSchedule, error: insertError } = await supabase
          .from('doctor_schedules')
          .insert([defaultSchedule])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating schedule:', insertError);
          throw new Error('Failed to create schedule');
        }

        setSchedule(newSchedule);
      } else {
        setSchedule(existingSchedule);
      }
    } catch (error) {
      console.error('Error in schedule management:', error);
      // Set default schedule in case of error
      setSchedule({
        working_hours: { start: '09:00', end: '17:00' },
        breaks: [{ start: '13:00', end: '14:00', type: 'Lunch Break' }],
        leaves: [],
        weekly_schedule: [
          { day: 'Monday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
          { day: 'Tuesday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
          { day: 'Wednesday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
          { day: 'Thursday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
          { day: 'Friday', slots: ['09:00 - 13:00', '14:00 - 17:00'] },
          { day: 'Saturday', slots: ['09:00 - 13:00'], status: 'Half Day' },
          { day: 'Sunday', slots: [], status: 'Closed' }
        ]
      });
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'schedule') {
      fetchSchedule();
    }
  }, [currentView]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePrescriptionSuccess = () => {
    fetchPrescriptions();
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId);

      if (error) throw error;

      // Refresh prescriptions list
      fetchPrescriptions();
      setDeletingPrescriptionId(null);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    }
  };

  const handlePrint = (prescription: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
              th { background: #f9fafb; }
            </style>
          </head>
          <body>
            <h1 style="text-align: center;">HealthCare Clinic</h1>
            <div style="margin: 20px 0;">
              <p><strong>Patient:</strong> ${prescription.patient?.name}</p>
              <p><strong>Date:</strong> ${new Date(prescription.created_at).toLocaleDateString()}</p>
              <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                ${prescription.medications?.map((med: any) => `
                  <tr>
                    <td>${med.name}</td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleUpdateWorkingHours = async (newHours: any) => {
    try {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      const { error } = await supabase
        .from('doctor_schedules')
        .upsert({
          doctor_id: doctorData.id,
          working_hours: newHours,
          breaks: schedule.breaks,
          leaves: schedule.leaves,
          weekly_schedule: schedule.weekly_schedule
        });

      if (error) throw error;
      fetchSchedule();
    } catch (error) {
      console.error('Error updating working hours:', error);
    }
  };

  const handleSaveWorkingHours = async (newHours: { start: string; end: string }) => {
    try {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (doctorError) throw doctorError;
      if (!doctorData?.id) throw new Error('No doctor found');

      // First try to update existing record
      const { error: updateError } = await supabase
        .from('doctor_schedules')
        .update({
          working_hours: newHours,
        })
        .eq('doctor_id', doctorData.id);

      // If no record exists, insert a new one
      if (updateError) {
        const { error: insertError } = await supabase
          .from('doctor_schedules')
          .insert([{
            doctor_id: doctorData.id,
            working_hours: newHours,
            breaks: [{ start: '13:00', end: '14:00', type: 'Lunch Break' }],
            leaves: [],
            weekly_schedule: schedule?.weekly_schedule || []
          }]);

        if (insertError) throw insertError;
      }

      await fetchSchedule(); // Refresh the schedule data
    } catch (error) {
      console.error('Error updating working hours:', error);
      throw error;
    }
  };

  const handleSaveBreaks = async (newBreaks: any[]) => {
    try {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (!doctorData?.id) {
        throw new Error('No doctor found');
      }

      const { error } = await supabase
        .from('doctor_schedules')
        .update({
          breaks: newBreaks
        })
        .eq('doctor_id', doctorData.id);

      if (error) throw error;
      
      await fetchSchedule(); // Refresh the schedule data
    } catch (error) {
      console.error('Error updating breaks:', error);
      throw error;
    }
  };

  const handleSaveLeaves = async (newLeaves: any[]) => {
    try {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (!doctorData?.id) {
        throw new Error('No doctor found');
      }

      const { error } = await supabase
        .from('doctor_schedules')
        .update({
          leaves: newLeaves
        })
        .eq('doctor_id', doctorData.id);

      if (error) throw error;
      
      await fetchSchedule(); // Refresh the schedule data
    } catch (error) {
      console.error('Error updating leaves:', error);
      throw error;
    }
  };

  const handleSaveSchedule = async (newSchedule: any[]) => {
    try {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .limit(1)
        .single();

      if (!doctorData?.id) {
        throw new Error('No doctor found');
      }

      const { error } = await supabase
        .from('doctor_schedules')
        .update({
          weekly_schedule: newSchedule
        })
        .eq('doctor_id', doctorData.id);

      if (error) throw error;
      
      await fetchSchedule(); // Refresh the schedule data
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  const sidebarItems = [
    { id: 'appointments', label: 'Appointments', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'patients', label: 'Patient Records', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: 'prescriptions', label: 'Prescriptions', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'schedule', label: 'My Schedule', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  ];

  const appointments = [
    { id: 'APP123', patient: 'John Doe', time: '10:00 AM', date: '2024-02-20', status: 'Confirmed' },
    { id: 'APP124', patient: 'Jane Smith', time: '11:30 AM', date: '2024-02-20', status: 'Completed' },
    // Add more appointments as needed
  ];

  const patientRecords = [
    {
      id: 'PT001',
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      lastVisit: '2024-02-15',
      condition: 'Hypertension',
      status: 'Active',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com'
    },
    {
      id: 'PT002',
      name: 'Jane Smith',
      age: 28,
      gender: 'Female',
      lastVisit: '2024-02-18',
      condition: 'Diabetes Type 2',
      status: 'Active',
      phone: '+1 (555) 987-6543',
      email: 'jane.smith@example.com'
    },
    // Add more patient records as needed
  ];

  // Add prescriptions data
  const prescriptions = [
    {
      id: 'PRE001',
      patient: 'John Doe',
      date: '2024-02-20',
      diagnosis: 'Hypertension',
      status: 'Active',
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Twice daily' }
      ]
    },
    {
      id: 'PRE002',
      patient: 'Jane Smith',
      date: '2024-02-19',
      diagnosis: 'Type 2 Diabetes',
      status: 'Active',
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
        { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily' }
      ]
    }
  ];

  // Add schedule data
  const scheduleData = {
    workingHours: { start: '09:00 AM', end: '06:00 PM' },
    breaks: [{ start: '01:00 PM', end: '02:00 PM', type: 'Lunch Break' }],
    upcomingLeaves: [
      { date: '2024-03-15', reason: 'Conference' },
      { date: '2024-03-25', reason: 'Personal' }
    ],
    weeklySchedule: [
      { day: 'Monday', slots: ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM'] },
      { day: 'Tuesday', slots: ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM'] },
      { day: 'Thursday', slots: ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM'] },
      { day: 'Saturday', slots: ['09:00 AM - 01:00 PM'], status: 'Half Day' },
      { day: 'Sunday', slots: [], status: 'Closed' }
    ]
  };

  // Add settings sections data
  const settingsSections = {
    profile: {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@healthcare.com",
      phone: "+1 (555) 234-5678",
      specialization: "Internal Medicine",
      experience: "15+ years",
      license: "MD-12345",
      avatar: "/doctor-profile.jpg"
    },
    notifications: [
      { type: "Email", enabled: true, label: "Email Notifications" },
      { type: "SMS", enabled: true, label: "SMS Alerts" },
      { type: "Desktop", enabled: false, label: "Desktop Notifications" }
    ],
    preferences: [
      { id: "darkMode", label: "Dark Mode", enabled: false },
      { id: "soundEffects", label: "Sound Effects", enabled: true },
      { id: "autoSchedule", label: "Auto Schedule Management", enabled: true }
    ],
    security: {
      lastPasswordChange: "2024-01-15",
      twoFactorEnabled: true
    }
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  const handleNewAppointmentSuccess = () => {
    // Refresh the appointments list
    if (currentView === 'appointments') {
      fetchAppointments();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 bg-white shadow-lg z-50 flex flex-col transition-all duration-300" 
        style={{ width: isSidebarOpen ? '256px' : '80px' }}>
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/" className={`font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ${isSidebarOpen ? 'block' : 'hidden'}`}>
            HealthCare Clinic
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span className={isSidebarOpen ? 'block' : 'hidden'}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link 
            href="/"
            className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={isSidebarOpen ? 'block' : 'hidden'}>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 bg-gray-50" style={{ marginLeft: isSidebarOpen ? '256px' : '80px' }}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {sidebarItems.find(item => item.id === currentView)?.label}
                </h1>
                <p className="text-gray-600 mt-1">Manage your appointments and schedule</p>
              </div>
              
              {currentView === 'appointments' && (
                <div className="flex gap-3 bg-white p-1 rounded-lg shadow-sm">
                  {['today', 'upcoming', 'past'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAppointmentFilter(filter)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        appointmentFilter === filter 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Patient Records View */}
            {currentView === 'patients' && (
              <div className="space-y-6">
                {/* Search and Filter Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search patients..."
                          value={searchQuery}
                          onChange={handleSearch}
                          className="w-full pl-10 text-black pr-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <Link 
                      href="/book-appointment"
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      + New Patient
                    </Link>
                  </div>
                </div>

                {/* Patient Records Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  {patientsLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading patients...</div>
                  ) : patients.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {searchQuery ? 'No patients found matching your search' : 'No patients found'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Age/Gender</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Last Visit</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Condition</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {patient.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                    {patient.name.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                    <div className="text-sm text-gray-500">{patient.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {patient.age} / {patient.gender}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {patient.lastVisit}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {patient.condition}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {patient.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => setSelectedPatientId(patient.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Showing 2 of 2 patients</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50">Previous</button>
                        <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50">Next</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prescriptions View */}
            {currentView === 'prescriptions' && (
              <div className="space-y-6">
                {/* Search and Actions Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[200px] max-w-xl">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search prescriptions..."
                          value={prescriptionSearchQuery}
                          onChange={(e) => setPrescriptionSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowNewPrescriptionModal(true)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      + New Prescription
                    </button>
                  </div>
                </div>

                {/* Prescriptions List */}
                <div className="space-y-4">
                  {prescriptionsLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading prescriptions...</div>
                  ) : prescriptionsList.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {prescriptionSearchQuery ? 'No prescriptions found matching your search' : 'No prescriptions found'}
                    </div>
                  ) : (
                    prescriptionsList.map((prescription) => (
                      <div 
                        key={prescription.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      >
                        {/* Prescription Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {prescription.patient?.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{prescription.patient?.name}</h3>
                                <p className="text-sm text-gray-500">ID: {prescription.id}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                              ${prescription.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'}`}
                            >
                              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex gap-6 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Date: </span>
                              {new Date(prescription.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Diagnosis: </span>
                              {prescription.diagnosis}
                            </div>
                          </div>
                        </div>

                        {/* Medications List */}
                        <div className="p-6 bg-gray-50">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Medications</h4>
                          <div className="grid gap-4">
                            {prescription.medications?.map((med, index) => (
                              <div key={index} className="flex items-center gap-4 text-sm">
                                <div className="w-1/3">
                                  <span className="font-medium text-gray-900">{med.name}</span>
                                </div>
                                <div className="w-1/3 text-gray-900">
                                  Dosage: {med.dosage}
                                </div>
                                <div className="w-1/3 text-gray-900">
                                  {med.frequency}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="px-6 py-4 bg-white border-t border-gray-100">
                          <div className="flex justify-end gap-4">
                            <button 
                              onClick={() => handlePrint(prescription)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Print
                            </button>
                            <button 
                              onClick={() => setDeletingPrescriptionId(prescription.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                            <button 
                              onClick={() => setSelectedPrescription(prescription)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {!prescriptionsLoading && prescriptionsList.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {prescriptionsList.length} prescription{prescriptionsList.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50">Previous</button>
                      <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50">Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* My Schedule View */}
            {currentView === 'schedule' && (
              <div className="space-y-6">
                {scheduleLoading ? (
                  <div className="text-center py-8">Loading schedule...</div>
                ) : (
                  <>
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Working Hours</h3>
                        <p className="text-gray-600">
                          {schedule?.working_hours?.start || '09:00'} - {schedule?.working_hours?.end || '17:00'}
                        </p>
                        <button 
                          onClick={() => setShowWorkingHoursModal(true)}
                          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Modify Hours →
                        </button>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Break Time</h3>
                        {schedule?.breaks?.map((break_: any, index: number) => (
                          <div key={index} className="text-gray-600">
                            {break_.type}: {break_.start} - {break_.end}
                          </div>
                        ))}
                        <button 
                          onClick={() => setShowBreakTimeModal(true)}
                          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Update Breaks →
                        </button>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Leaves</h3>
                        {schedule?.leaves?.map((leave: any, index: number) => (
                          <div key={index} className="text-gray-600 mb-1">
                            {new Date(leave.date).toLocaleDateString()} - {leave.reason}
                          </div>
                        ))}
                        <button 
                          onClick={() => setShowLeaveModal(true)}
                          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Book a Leave →
                        </button>
                      </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-800">Weekly Schedule</h2>
                          <button 
                            onClick={() => setShowEditScheduleModal(true)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Edit Schedule
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid gap-4">
                          {schedule?.weekly_schedule?.map((day: any) => (
                            <div key={day.day} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                              <div className="w-32">
                                <span className="font-medium text-gray-900">{day.day}</span>
                              </div>
                              <div className="flex-1">
                                {day.slots.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {day.slots.map((slot: any, index: number) => (
                                      <span 
                                        key={index}
                                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                      >
                                        {slot}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No slots available</span>
                                )}
                              </div>
                              {day.status && (
                                <div className="ml-4">
                                  <span className={`px-3 py-1 rounded-full text-sm
                                    ${day.status === 'Half Day' 
                                      ? 'bg-yellow-50 text-yellow-700' 
                                      : 'bg-red-50 text-red-700'}`}
                                  >
                                    {day.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Notes */}
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="text-blue-900 font-medium mb-1">Schedule Notes</h4>
                          <p className="text-blue-700 text-sm">
                            Changes to your schedule will be reflected in the appointment booking system.
                            Please ensure to update your schedule at least 24 hours in advance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Settings View */}
            {currentView === 'settings' && (
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Profile Settings</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/4 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden mb-4">
                          <Image
                            src={settingsSections.profile.avatar}
                            alt="Doctor Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button className="text-blue-600 text-sm hover:text-blue-700">
                          Change Photo
                        </button>
                      </div>
                      <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(settingsSections.profile).map(([key, value]) => (
                          key !== 'avatar' && (
                            <div key={key} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              <input
                                type="text"
                                value={value}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Notification Preferences</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {settingsSections.notifications.map((notification) => (
                        <div key={notification.type} className="flex items-center justify-between">
                          <span className="text-gray-700">{notification.label}</span>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notification.enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notification.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Current Password</label>
                          <input
                            type="password"
                            className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600">Add an extra layer of security to your account</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {settingsSections.security.twoFactorEnabled 
                              ? 'Two-factor authentication is enabled'
                              : 'Two-factor authentication is disabled'}
                          </p>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            settingsSections.security.twoFactorEnabled
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {settingsSections.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="flex justify-end">
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Appointments Table */}
            {currentView === 'appointments' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {appointmentFilter === 'today' ? "Today's" : 
                      appointmentFilter === 'upcoming' ? "Upcoming" : "Past"} Appointments
                    </h2>
                    <button 
                      onClick={() => setShowNewAppointmentModal(true)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      + New Appointment
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading appointments...</div>
                  ) : todayAppointments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No appointments scheduled for today</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {todayAppointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {appointment.confirmation_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                  {appointment.patient?.name.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{appointment.patient?.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appointment.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appointment.patient?.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => handleViewDetails(appointment)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {todayAppointments.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {/* Add New Appointment Modal */}
      {showNewAppointmentModal && (
        <NewAppointmentModal
          onClose={() => setShowNewAppointmentModal(false)}
          onSuccess={handleNewAppointmentSuccess}
        />
      )}

      {/* Add Patient Details Modal */}
      {selectedPatientId && (
        <PatientDetailsModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}

      {/* Add New Prescription Modal */}
      {showNewPrescriptionModal && (
        <NewPrescriptionModal
          onClose={() => setShowNewPrescriptionModal(false)}
          onSuccess={handlePrescriptionSuccess}
        />
      )}

      {/* Add Delete Confirmation Modal */}
      {deletingPrescriptionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Prescription
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this prescription? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletingPrescriptionId(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePrescription(deletingPrescriptionId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Prescription Details Modal */}
      {selectedPrescription && (
        <PrescriptionDetailsModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

      {/* Add Working Hours Modal */}
      {showWorkingHoursModal && (
        <WorkingHoursModal
          currentHours={schedule?.working_hours || { start: '09:00', end: '17:00' }}
          onSave={handleSaveWorkingHours}
          onClose={() => setShowWorkingHoursModal(false)}
        />
      )}

      {/* Add Break Time Modal */}
      {showBreakTimeModal && (
        <BreakTimeModal
          currentBreaks={schedule?.breaks || []}
          onSave={handleSaveBreaks}
          onClose={() => setShowBreakTimeModal(false)}
        />
      )}

      {/* Add Leave Modal */}
      {showLeaveModal && (
        <LeaveModal
          currentLeaves={schedule?.leaves || []}
          onSave={handleSaveLeaves}
          onClose={() => setShowLeaveModal(false)}
        />
      )}

      {/* Add Edit Schedule Modal */}
      {showEditScheduleModal && (
        <EditScheduleModal
          currentSchedule={schedule?.weekly_schedule || []}
          onSave={handleSaveSchedule}
          onClose={() => setShowEditScheduleModal(false)}
        />
      )}
    </div>
  );
}

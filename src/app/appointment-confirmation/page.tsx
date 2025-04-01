"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';

export default function AppointmentConfirmation() {
  const searchParams = useSearchParams();
  
  const appointmentDetails = {
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    dob: searchParams.get('dob') || '',
    service: searchParams.get('service') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    doctor: 'Dr. Sarah Johnson',
    confirmationId: searchParams.get('confirmationId') || '',
    amount: '₹1180.00'
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add clinic logo/header
    doc.setFontSize(22);
    doc.setTextColor(0, 87, 183); // Blue color
    doc.text('HealthCare Clinic', 105, 20, { align: 'center' });
    
    // Add appointment confirmation title
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text('Appointment Confirmation', 105, 40, { align: 'center' });
    
    // Add confirmation ID
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Confirmation ID: ${appointmentDetails.confirmationId}`, 20, 60);
    
    // Add appointment details
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    
    const details = [
      ['Patient Information:', ''],
      [`Name: ${appointmentDetails.name}`, `Phone: ${appointmentDetails.phone}`],
      [`Email: ${appointmentDetails.email}`, `DOB: ${appointmentDetails.date}`],
      ['', ''],
      ['Appointment Details:', ''],
      [`Service: ${appointmentDetails.service}`, `Doctor: Dr Sanjeev Mohanty`],
      [`Date: ${appointmentDetails.date}`, `Time: ${appointmentDetails.time}`],
      ['', ''],
      ['Payment Details:', ''],
      [`Amount Paid: ${appointmentDetails.amount}`, `Status: Confirmed`],
    ];
    
    let yPos = 80;
    details.forEach(([left, right]) => {
      doc.text(left, 20, yPos);
      doc.text(right, 110, yPos);
      yPos += 10;
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const footer = [
      'Please arrive 10 minutes before your scheduled appointment.',
      'For any queries, contact us at: contact@healthcare.com',
      ' '
    ];
    
    yPos = 250;
    footer.forEach((line) => {
      doc.text(line, 105, yPos, { align: 'center' });
      yPos += 7;
    });
    
    // Save the PDF
    doc.save(`Appointment-${appointmentDetails.confirmationId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-4">
      {/* Return to Home - Moved to top */}
      <div className="max-w-2xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Home
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Appointment Confirmed!</h1>
            <p className="text-gray-600">Your appointment has been successfully scheduled</p>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Confirmation ID</span>
              <span className="font-semibold text-gray-800">{appointmentDetails.confirmationId}</span>
            </div>
            {[
              { label: 'Patient Name', value: appointmentDetails.name },
              { label: 'Service', value: appointmentDetails.service },
              { label: 'Date', value: appointmentDetails.date },
              { label: 'Time', value: appointmentDetails.time },
              { label: 'Doctor', value: "Dr. Sanjeev Mohanty" },
            ].map((detail) => (
              <div key={detail.label} className="flex justify-between items-center">
                <span className="text-gray-600">{detail.label}</span>
                <span className="text-gray-800">{detail.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div>
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Confirmation
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600">
            <p>You will receive a confirmation email shortly.</p>
            <p className="mt-1">Please arrive 10 minutes before your scheduled appointment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

package com.example.hospitalmanagementsystem.config;

import com.example.hospitalmanagementsystem.entity.*;
import com.example.hospitalmanagementsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private LabReportRepository labReportRepository;
    @Autowired private MedicineRepository medicineRepository;
    @Autowired private PrescriptionRepository prescriptionRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private TelemedicineRepository telemedicineRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only run if the database is empty
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded.");
            return;
        }

        System.out.println("Starting Database Seeder...");
        Random random = new Random();

        // 1. Create Admin
        User admin = new User(null, "Admin System", "saisurya@hospital.com", "saisurya@1312", "ADMIN", null);
        userRepository.save(admin);

        // 2. Create 10 Doctors
        String[] specializations = {"Cardiology", "Neurology", "Pediatrics", "Orthopedics", "General Medicine"};
        String[] doctorNames = {"Smith", "Patel", "Johnson", "Davis", "Chen", "Gomez", "Kim", "Lee", "Taylor", "Brown"};
        List<Doctor> doctors = new ArrayList<>();
        
        for (int i = 0; i < 10; i++) {
            Doctor doc = new Doctor(null, "Dr. " + doctorNames[i], specializations[i % specializations.length], "555-10" + i, "dr." + doctorNames[i].toLowerCase() + "@doctor.com", 5 + i);
            doc = doctorRepository.save(doc);
            doctors.add(doc);
            
            // Create User account for doctor
            User docUser = new User(null, doc.getDoctorName(), doc.getEmail(), "doctor123", "DOCTOR", doc.getDoctorId());
            userRepository.save(docUser);
        }

        // 3. Create 30 Patients
        String[] patientFirstNames = {"John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah"};
        String[] patientLastNames = {"Doe", "Smith", "Williams", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez"};
        List<Patient> patients = new ArrayList<>();

        for (int i = 0; i < 30; i++) {
            String name = patientFirstNames[i % 10] + " " + patientLastNames[(i / 3) % 10] + " " + i;
            Patient pat = new Patient(null, name, 20 + (i % 50), (i % 2 == 0) ? "Male" : "Female", "555-20" + i, "123 Main St, City");
            pat = patientRepository.save(pat);
            patients.add(pat);

            // Create User account for patient
            String email = patientFirstNames[i % 10].toLowerCase() + i + "@gmail.com";
            User patUser = new User(null, pat.getPatientName(), email, "patient123", "PATIENT", pat.getPatientId());
            userRepository.save(patUser);
        }

        // 4. Create 50 Appointments, interlinked
        List<Appointment> appointments = new ArrayList<>();
        AppointmentStatus[] statuses = AppointmentStatus.values();
        String[] reasons = {"Routine Checkup", "Fever", "Back Pain", "Headache", "Follow-up", "Annual Physical"};

        for (int i = 0; i < 50; i++) {
            Patient p = patients.get(random.nextInt(patients.size()));
            Doctor d = doctors.get(random.nextInt(doctors.size()));
            AppointmentStatus status = statuses[random.nextInt(statuses.length)];
            
            Appointment appt = new Appointment();
            appt.setPatient(p);
            appt.setDoctor(d);
            appt.setAppointmentDate(LocalDate.now().plusDays(random.nextInt(14) - 7)); // Range: 1 week ago to 1 week future
            appt.setAppointmentTime(LocalTime.of(9 + random.nextInt(8), (random.nextInt(2) == 0) ? 0 : 30));
            appt.setReason(reasons[random.nextInt(reasons.length)]);
            appt.setDuration(30);
            appt.setStatus(status);
            
            if (status == AppointmentStatus.COMPLETED) {
                appt.setNotes("Patient is doing well. Recommend rest and hydration.");
            }
            
            appt = appointmentRepository.save(appt);
            appointments.add(appt);
        }

        // 5. Create Lab Reports for some completed appointments
        List<String> reportTypes = Arrays.asList("Complete Blood Count", "Chest X-Ray", "MRI Scan", "Lipid Panel");
        for (Appointment a : appointments) {
            if (a.getStatus() == AppointmentStatus.COMPLETED && random.nextBoolean()) {
                LabReport lr = new LabReport(null, a.getPatient().getPatientId(), a.getDoctor().getDoctorId(), 
                        reportTypes.get(random.nextInt(reportTypes.size())), 
                        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", 
                        a.getAppointmentDate());
                labReportRepository.save(lr);
            }
        }

        // 6. Pharmacy (Medicines)
        List<Medicine> inventory = new ArrayList<>();
        inventory.add(new Medicine(null, "Paracetamol 500mg", 500, 50.0, "PharmaCorp"));
        inventory.add(new Medicine(null, "Amoxicillin 250mg", 300, 120.0, "HealthMed"));
        inventory.add(new Medicine(null, "Ibuprofen 400mg", 450, 80.0, "PainRelief Inc"));
        inventory.add(new Medicine(null, "Cough Syrup 100ml", 200, 150.0, "CarePharma"));
        inventory.add(new Medicine(null, "Vitamin C 1000mg", 1000, 200.0, "Wellness Co"));
        medicineRepository.saveAll(inventory);

        // 7. Prescriptions and Bills
        for (Appointment a : appointments) {
            if (a.getStatus() == AppointmentStatus.COMPLETED) {
                // Add a prescription
                Prescription pres = new Prescription(null, a, a.getPatient(), a.getDoctor(),
                        inventory.get(random.nextInt(inventory.size())).getName(),
                        "1 tablet twice a day", "Take after meals", a.getAppointmentDate());
                prescriptionRepository.save(pres);

                // Add a consultation bill (Some PAID, some UNPAID)
                String pStatus = random.nextBoolean() ? "PAID" : "UNPAID";
                Bill bill = new Bill(null, a.getPatient(), a, 500.0 + random.nextInt(1000), pStatus, a.getAppointmentDate(), 
                        "PAID".equals(pStatus) ? "CARD" : null,
                        "PAID".equals(pStatus) ? "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() : null,
                        "PAID".equals(pStatus) ? a.getAppointmentDate() : null,
                        "Consultation with " + a.getDoctor().getDoctorName());
                billRepository.save(bill);
            }
        }

        // 8. Add some Telemedicine Sessions
        List<TelemedicineSession> teleSessions = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Appointment appt = appointments.get(i);
            TelemedicineSession session = new TelemedicineSession(
                    null, appt, appt.getPatient(), appt.getDoctor(),
                    "ROOM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    "WAITING", appt.getAppointmentDate(), appt.getAppointmentTime(),
                    null, null, "Follow-up consultation"
            );
            teleSessions.add(session);
        }
        telemedicineRepository.saveAll(teleSessions);

        System.out.println("Database Seeding Completed Successfully.");
    }
}

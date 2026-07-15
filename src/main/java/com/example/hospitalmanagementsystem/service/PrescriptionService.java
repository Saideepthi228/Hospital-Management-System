package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.PrescriptionDTO;
import com.example.hospitalmanagementsystem.entity.Appointment;
import com.example.hospitalmanagementsystem.entity.Doctor;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.entity.Prescription;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.AppointmentRepository;
import com.example.hospitalmanagementsystem.repository.DoctorRepository;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import com.example.hospitalmanagementsystem.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // Add Prescription
    public PrescriptionDTO savePrescription(PrescriptionDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + dto.getAppointmentId()));
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));

        Prescription prescription = toEntity(dto, appointment, patient, doctor);
        Prescription saved = prescriptionRepository.save(prescription);
        return toDTO(saved);
    }

    // Get All Prescriptions
    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get Prescription By ID
    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
        return toDTO(prescription);
    }

    // Update Prescription
    public PrescriptionDTO updatePrescription(Long id, PrescriptionDTO dto) {
        Prescription existing = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + dto.getAppointmentId()));
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));

        existing.setAppointment(appointment);
        existing.setPatient(patient);
        existing.setDoctor(doctor);
        existing.setMedication(dto.getMedication());
        existing.setDosage(dto.getDosage());
        existing.setInstructions(dto.getInstructions());
        existing.setPrescriptionDate(dto.getPrescriptionDate());

        Prescription updated = prescriptionRepository.save(existing);
        return toDTO(updated);
    }

    // Delete Prescription
    public void deletePrescription(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prescription not found with id: " + id);
        }
        prescriptionRepository.deleteById(id);
    }

    // Get Prescriptions by Patient ID
    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get Prescriptions by Doctor ID
    public List<PrescriptionDTO> getPrescriptionsByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorDoctorId(doctorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // --- Mapping helpers ---

    private PrescriptionDTO toDTO(Prescription prescription) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setPrescriptionId(prescription.getPrescriptionId());
        dto.setAppointmentId(prescription.getAppointment().getAppointmentId());
        dto.setPatientId(prescription.getPatient().getPatientId());
        dto.setPatientName(prescription.getPatient().getPatientName());
        dto.setDoctorId(prescription.getDoctor().getDoctorId());
        dto.setDoctorName(prescription.getDoctor().getDoctorName());
        dto.setMedication(prescription.getMedication());
        dto.setDosage(prescription.getDosage());
        dto.setInstructions(prescription.getInstructions());
        dto.setPrescriptionDate(prescription.getPrescriptionDate());
        return dto;
    }

    private Prescription toEntity(PrescriptionDTO dto, Appointment appointment, Patient patient, Doctor doctor) {
        Prescription prescription = new Prescription();
        prescription.setAppointment(appointment);
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setMedication(dto.getMedication());
        prescription.setDosage(dto.getDosage());
        prescription.setInstructions(dto.getInstructions());
        prescription.setPrescriptionDate(dto.getPrescriptionDate());
        return prescription;
    }
}

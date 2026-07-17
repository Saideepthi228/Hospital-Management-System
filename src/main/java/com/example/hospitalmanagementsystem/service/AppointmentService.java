package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.AppointmentDTO;
import com.example.hospitalmanagementsystem.entity.Appointment;
import com.example.hospitalmanagementsystem.entity.Doctor;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.AppointmentRepository;
import com.example.hospitalmanagementsystem.repository.DoctorRepository;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // Add Appointment
    public AppointmentDTO saveAppointment(AppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));

        Appointment appointment = toEntity(dto, patient, doctor);
        Appointment saved = appointmentRepository.save(appointment);
        return toDTO(saved);
    }

    // Get All Appointments
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get Appointment By ID
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return toDTO(appointment);
    }

    // Update Appointment
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO dto) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));

        existing.setPatient(patient);
        existing.setDoctor(doctor);
        existing.setAppointmentDate(dto.getAppointmentDate());
        existing.setAppointmentTime(dto.getAppointmentTime());
        existing.setReason(dto.getReason());
        existing.setDuration(dto.getDuration());
        existing.setNotes(dto.getNotes());
        existing.setStatus(dto.getStatus());

        Appointment updated = appointmentRepository.save(existing);
        return toDTO(updated);
    }

    // Delete Appointment
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    // Get Appointments By Doctor
    public List<AppointmentDTO> getByDoctor(Long doctorId) {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getDoctor().getDoctorId().equals(doctorId))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get Appointments By Patient
    public List<AppointmentDTO> getByPatient(Long patientId) {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getPatient().getPatientId().equals(patientId))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // --- Mapping helpers ---

    private AppointmentDTO toDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setAppointmentId(appointment.getAppointmentId());
        dto.setPatientId(appointment.getPatient().getPatientId());
        dto.setDoctorId(appointment.getDoctor().getDoctorId());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setReason(appointment.getReason());
        dto.setDuration(appointment.getDuration());
        dto.setNotes(appointment.getNotes());
        dto.setStatus(appointment.getStatus());
        return dto;
    }

    private Appointment toEntity(AppointmentDTO dto, Patient patient, Doctor doctor) {
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setReason(dto.getReason());
        appointment.setDuration(dto.getDuration());
        appointment.setNotes(dto.getNotes());
        appointment.setStatus(dto.getStatus());
        return appointment;
    }
}
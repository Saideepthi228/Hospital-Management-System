package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.TelemedicineDTO;
import com.example.hospitalmanagementsystem.entity.*;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TelemedicineService {

    @Autowired
    private TelemedicineRepository telemedicineRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Create Session
    public TelemedicineDTO createSession(TelemedicineDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));

        Appointment appointment = null;
        if (dto.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + dto.getAppointmentId()));
        }

        TelemedicineSession session = new TelemedicineSession();
        session.setAppointment(appointment);
        session.setPatient(patient);
        session.setDoctor(doctor);
        session.setRoomCode("ROOM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        session.setStatus("WAITING");
        session.setScheduledDate(dto.getScheduledDate());
        session.setScheduledTime(dto.getScheduledTime());

        TelemedicineSession saved = telemedicineRepository.save(session);
        return toDTO(saved);
    }

    // Join Session
    public TelemedicineDTO joinSession(Long sessionId) {
        TelemedicineSession session = telemedicineRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        session.setStatus("ACTIVE");
        session.setStartedAt(LocalTime.now());

        TelemedicineSession updated = telemedicineRepository.save(session);
        return toDTO(updated);
    }

    // End Session
    public TelemedicineDTO endSession(Long sessionId) {
        TelemedicineSession session = telemedicineRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        session.setStatus("ENDED");
        session.setEndedAt(LocalTime.now());

        TelemedicineSession updated = telemedicineRepository.save(session);
        return toDTO(updated);
    }

    // Get All Sessions
    public List<TelemedicineDTO> getAllSessions() {
        return telemedicineRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get by Doctor
    public List<TelemedicineDTO> getByDoctor(Long doctorId) {
        return telemedicineRepository.findByDoctorDoctorId(doctorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get by Patient
    public List<TelemedicineDTO> getByPatient(Long patientId) {
        return telemedicineRepository.findByPatientPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get by Room Code
    public TelemedicineDTO getByRoomCode(String roomCode) {
        TelemedicineSession session = telemedicineRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with room code: " + roomCode));
        return toDTO(session);
    }

    // Get by ID
    public TelemedicineDTO getById(Long id) {
        TelemedicineSession session = telemedicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        return toDTO(session);
    }

    // --- Mapping helpers ---

    private TelemedicineDTO toDTO(TelemedicineSession session) {
        TelemedicineDTO dto = new TelemedicineDTO();
        dto.setSessionId(session.getSessionId());
        if (session.getAppointment() != null) {
            dto.setAppointmentId(session.getAppointment().getAppointmentId());
        }
        dto.setPatientId(session.getPatient().getPatientId());
        dto.setPatientName(session.getPatient().getPatientName());
        dto.setDoctorId(session.getDoctor().getDoctorId());
        dto.setDoctorName(session.getDoctor().getDoctorName());
        dto.setRoomCode(session.getRoomCode());
        dto.setStatus(session.getStatus());
        dto.setScheduledDate(session.getScheduledDate());
        dto.setScheduledTime(session.getScheduledTime());
        dto.setStartedAt(session.getStartedAt());
        dto.setEndedAt(session.getEndedAt());
        dto.setNotes(session.getNotes());
        return dto;
    }
}

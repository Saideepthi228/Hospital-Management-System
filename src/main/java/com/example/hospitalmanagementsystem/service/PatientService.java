package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.PatientDTO;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    // Add Patient
    public PatientDTO savePatient(PatientDTO dto) {
        Patient patient = toEntity(dto);
        Patient saved = patientRepository.save(patient);
        return toDTO(saved);
    }

    // Get All Patients
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get Patient By ID
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return toDTO(patient);
    }

    // Update Patient
    public PatientDTO updatePatient(Long id, PatientDTO dto) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        existing.setPatientName(dto.getPatientName());
        existing.setAge(dto.getAge());
        existing.setGender(dto.getGender());
        existing.setPhoneNumber(dto.getPhoneNumber());
        existing.setAddress(dto.getAddress());

        Patient updated = patientRepository.save(existing);
        return toDTO(updated);
    }

    // Delete Patient
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }

    // --- Mapping helpers ---

    private PatientDTO toDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setPatientId(patient.getPatientId());
        dto.setPatientName(patient.getPatientName());
        dto.setAge(patient.getAge());
        dto.setGender(patient.getGender());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setAddress(patient.getAddress());
        return dto;
    }

    private Patient toEntity(PatientDTO dto) {
        Patient patient = new Patient();
        patient.setPatientName(dto.getPatientName());
        patient.setAge(dto.getAge());
        patient.setGender(dto.getGender());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setAddress(dto.getAddress());
        return patient;
    }
}
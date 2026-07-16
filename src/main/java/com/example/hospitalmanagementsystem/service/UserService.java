package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.UserDTO;
import com.example.hospitalmanagementsystem.entity.Doctor;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.DoctorRepository;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import com.example.hospitalmanagementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    // Register user
    @Transactional
    public UserDTO registerUser(UserDTO dto) {
        Optional<User> existingEmail = userRepository.findByEmail(dto.getEmail());
        if (existingEmail.isPresent()) {
            throw new IllegalArgumentException("Email '" + dto.getEmail() + "' is already taken.");
        }

        User user = toEntity(dto);

        // If registering as a DOCTOR, create a Doctor record and link it
        if ("DOCTOR".equalsIgnoreCase(dto.getRole())) {
            Doctor doctor = new Doctor();
            doctor.setDoctorName(dto.getUsername());
            doctor.setSpecialization("General"); // default, can be updated later
            doctor.setPhoneNumber("N/A");        // default, can be updated later
            doctor.setEmail(dto.getEmail());
            doctor.setExperience(0);
            Doctor savedDoctor = doctorRepository.save(doctor);
            user.setRefId(savedDoctor.getDoctorId());
        }

        // If registering as a PATIENT, create a Patient record and link it
        if ("PATIENT".equalsIgnoreCase(dto.getRole())) {
            Patient patient = new Patient();
            patient.setPatientName(dto.getUsername());
            patient.setAge(0);                   // default, can be updated later
            patient.setGender("Not Specified");
            patient.setPhoneNumber("N/A");
            patient.setAddress("N/A");
            Patient savedPatient = patientRepository.save(patient);
            user.setRefId(savedPatient.getPatientId());
        }

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    // Login user
    public UserDTO loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return toDTO(user);
    }

    // Mapping helpers
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPassword(user.getPassword());
        dto.setRole(user.getRole());
        dto.setRefId(user.getRefId());
        return dto;
    }

    private User toEntity(UserDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());
        user.setRefId(dto.getRefId());
        return user;
    }
}

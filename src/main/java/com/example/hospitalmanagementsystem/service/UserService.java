package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.UserDTO;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.hospitalmanagementsystem.repository.DoctorRepository doctorRepository;

    @Autowired
    private com.example.hospitalmanagementsystem.repository.PatientRepository patientRepository;

    // Register user
    public UserDTO registerUser(UserDTO dto) {
        Optional<User> existingEmail = userRepository.findByEmail(dto.getEmail());
        if (existingEmail.isPresent()) {
            throw new IllegalArgumentException("Email '" + dto.getEmail() + "' is already taken.");
        }

    // Security: Enforce that role matches email domain
        String email = dto.getEmail();
        String role = dto.getRole();
        if ("DOCTOR".equalsIgnoreCase(role) && !email.endsWith("@doctor.com")) {
            throw new IllegalArgumentException("Doctor accounts must use an @doctor.com email address.");
        }
        if ("ADMIN".equalsIgnoreCase(role) && !email.endsWith("@hospital.com")) {
            throw new IllegalArgumentException("Admin accounts must use an @hospital.com email address.");
        }

        User user = toEntity(dto);

        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            com.example.hospitalmanagementsystem.entity.Doctor doctor = new com.example.hospitalmanagementsystem.entity.Doctor();
            doctor.setDoctorName(user.getUsername());
            doctor.setEmail(user.getEmail());
            doctor.setSpecialization("Not Specified");
            doctor.setPhoneNumber("Not Specified");
            doctor.setExperience(0);
            doctor = doctorRepository.save(doctor);
            user.setRefId(doctor.getDoctorId());
        } else if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            com.example.hospitalmanagementsystem.entity.Patient patient = new com.example.hospitalmanagementsystem.entity.Patient();
            patient.setPatientName(user.getUsername());
            patient.setAge(0);
            patient.setGender("Not Specified");
            patient.setPhoneNumber("Not Specified");
            patient.setAddress("Not Specified");
            patient = patientRepository.save(patient);
            user.setRefId(patient.getPatientId());
        }

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    // Login user
    public UserDTO loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

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

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

    // Register user
    public UserDTO registerUser(UserDTO dto) {
        Optional<User> existingEmail = userRepository.findByEmail(dto.getEmail());
        if (existingEmail.isPresent()) {
            throw new IllegalArgumentException("Email '" + dto.getEmail() + "' is already taken.");
        }

        User user = toEntity(dto);
        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    // Login user
    public UserDTO loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid username or password");
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

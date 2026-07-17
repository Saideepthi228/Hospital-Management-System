package com.example.hospitalmanagementsystem;

import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class HospitalManagementSystemApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoads() {
        Optional<User> adminUser = userRepository.findByUsername("admin");
        assertTrue(adminUser.isPresent(), "Admin user should be present in the database");
        assertEquals("admin@hospital.com", adminUser.get().getEmail());
        assertEquals("ADMIN", adminUser.get().getRole());
    }

}

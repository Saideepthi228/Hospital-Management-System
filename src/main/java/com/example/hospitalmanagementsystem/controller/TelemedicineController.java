package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.dto.TelemedicineDTO;
import com.example.hospitalmanagementsystem.service.TelemedicineService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/telemedicine")
public class TelemedicineController {

    @Autowired
    private TelemedicineService telemedicineService;

    // Create Session
    @PostMapping
    public ResponseEntity<TelemedicineDTO> createSession(@Valid @RequestBody TelemedicineDTO dto) {
        TelemedicineDTO saved = telemedicineService.createSession(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Get All Sessions
    @GetMapping
    public ResponseEntity<List<TelemedicineDTO>> getAllSessions() {
        return ResponseEntity.ok(telemedicineService.getAllSessions());
    }

    // Get Session By ID
    @GetMapping("/{id}")
    public ResponseEntity<TelemedicineDTO> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(telemedicineService.getById(id));
    }

    // Get Sessions by Doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<TelemedicineDTO>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(telemedicineService.getByDoctor(doctorId));
    }

    // Get Sessions by Patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TelemedicineDTO>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(telemedicineService.getByPatient(patientId));
    }

    // Get Session by Room Code
    @GetMapping("/room/{roomCode}")
    public ResponseEntity<TelemedicineDTO> getByRoomCode(@PathVariable String roomCode) {
        return ResponseEntity.ok(telemedicineService.getByRoomCode(roomCode));
    }

    // Join Session
    @PostMapping("/{id}/join")
    public ResponseEntity<TelemedicineDTO> joinSession(@PathVariable Long id) {
        return ResponseEntity.ok(telemedicineService.joinSession(id));
    }

    // End Session
    @PostMapping("/{id}/end")
    public ResponseEntity<TelemedicineDTO> endSession(@PathVariable Long id) {
        return ResponseEntity.ok(telemedicineService.endSession(id));
    }
}

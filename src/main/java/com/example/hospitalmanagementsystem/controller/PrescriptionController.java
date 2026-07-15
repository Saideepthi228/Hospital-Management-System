package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.dto.PrescriptionDTO;
import com.example.hospitalmanagementsystem.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    // Add Prescription
    @PostMapping
    public ResponseEntity<PrescriptionDTO> addPrescription(@Valid @RequestBody PrescriptionDTO prescriptionDTO) {
        PrescriptionDTO saved = prescriptionService.savePrescription(prescriptionDTO);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Get All Prescriptions
    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getAllPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    // Get Prescription By ID
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    // Update Prescription
    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> updatePrescription(@PathVariable Long id,
                                                              @Valid @RequestBody PrescriptionDTO prescriptionDTO) {
        PrescriptionDTO updated = prescriptionService.updatePrescription(id, prescriptionDTO);
        return ResponseEntity.ok(updated);
    }

    // Delete Prescription
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }

    // Get Prescriptions by Patient ID
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    // Get Prescriptions by Doctor ID
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(doctorId));
    }
}

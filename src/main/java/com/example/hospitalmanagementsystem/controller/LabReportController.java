package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.entity.LabReport;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.LabReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/lab-reports")
@CrossOrigin(origins = "*") // Allows requests from React frontend
public class LabReportController {

    @Autowired
    private LabReportRepository labReportRepository;

    @GetMapping
    public List<LabReport> getAllLabReports() {
        return labReportRepository.findAll();
    }

    @GetMapping("/patient/{patientId}")
    public List<LabReport> getLabReportsByPatient(@PathVariable Long patientId) {
        return labReportRepository.findByPatientId(patientId);
    }

    @GetMapping("/{id}")
    public LabReport getLabReportById(@PathVariable Long id) {
        return labReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LabReport not found with id: " + id));
    }

    @PostMapping
    public LabReport createLabReport(@RequestBody LabReport labReport) {
        if(labReport.getReportDate() == null) {
            labReport.setReportDate(LocalDate.now());
        }
        return labReportRepository.save(labReport);
    }

    @PutMapping("/{id}")
    public LabReport updateLabReport(@PathVariable Long id, @RequestBody LabReport reportDetails) {
        LabReport report = labReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LabReport not found with id: " + id));

        report.setReportType(reportDetails.getReportType());
        report.setReportUrl(reportDetails.getReportUrl());
        return labReportRepository.save(report);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLabReport(@PathVariable Long id) {
        LabReport report = labReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LabReport not found with id: " + id));

        labReportRepository.delete(report);
        return ResponseEntity.noContent().build();
    }
}

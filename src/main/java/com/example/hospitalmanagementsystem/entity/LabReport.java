package com.example.hospitalmanagementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "lab_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long doctorId;

    @NotBlank(message = "Report type is required")
    @Column(nullable = false, length = 100)
    private String reportType; // e.g. Blood Test, X-Ray

    @Column(nullable = false)
    private String reportUrl; // Link to document

    @Column(nullable = false)
    private LocalDate reportDate;
}

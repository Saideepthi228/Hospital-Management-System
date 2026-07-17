package com.example.hospitalmanagementsystem.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TelemedicineDTO {

    private Long sessionId;

    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String patientName;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String doctorName;

    private String roomCode;

    @NotNull(message = "Status is required")
    private String status; // WAITING, ACTIVE, ENDED

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;

    @NotNull(message = "Scheduled time is required")
    private LocalTime scheduledTime;

    private LocalTime startedAt;

    private LocalTime endedAt;

    private String notes;
}

package com.example.hospitalmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillDTO {

    private Long billId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String patientName;

    private Long appointmentId;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Payment status is required")
    private String paymentStatus; // PAID, UNPAID

    @NotNull(message = "Billing date is required")
    private LocalDate billingDate;
}

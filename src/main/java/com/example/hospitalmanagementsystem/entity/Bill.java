package com.example.hospitalmanagementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @NotNull(message = "Patient is required")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Payment status is required")
    private String paymentStatus; // PAID, UNPAID

    @NotNull(message = "Billing date is required")
    private LocalDate billingDate;

    private String paymentMethod; // CARD, CASH, UPI, INSURANCE

    private String transactionId;

    private LocalDate paidDate;

    private String description;
}

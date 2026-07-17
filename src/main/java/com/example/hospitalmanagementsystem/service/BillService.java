package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.BillDTO;
import com.example.hospitalmanagementsystem.entity.Appointment;
import com.example.hospitalmanagementsystem.entity.Bill;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.exception.ResourceNotFoundException;
import com.example.hospitalmanagementsystem.repository.AppointmentRepository;
import com.example.hospitalmanagementsystem.repository.BillRepository;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Add Bill
    public BillDTO saveBill(BillDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));

        Appointment appointment = null;
        if (dto.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + dto.getAppointmentId()));
        }

        Bill bill = toEntity(dto, patient, appointment);
        Bill saved = billRepository.save(bill);
        return toDTO(saved);
    }

    // Get All Bills
    public List<BillDTO> getAllBills() {
        return billRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get Bill By ID
    public BillDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        return toDTO(bill);
    }

    // Update Bill
    public BillDTO updateBill(Long id, BillDTO dto) {
        Bill existing = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));

        Appointment appointment = null;
        if (dto.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + dto.getAppointmentId()));
        }

        existing.setPatient(patient);
        existing.setAppointment(appointment);
        existing.setAmount(dto.getAmount());
        existing.setPaymentStatus(dto.getPaymentStatus());
        existing.setBillingDate(dto.getBillingDate());

        Bill updated = billRepository.save(existing);
        return toDTO(updated);
    }

    // Delete Bill
    public void deleteBill(Long id) {
        if (!billRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bill not found with id: " + id);
        }
        billRepository.deleteById(id);
    }

    // Get Bills by Patient ID
    public List<BillDTO> getBillsByPatient(Long patientId) {
        return billRepository.findByPatientPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Process Payment
    public BillDTO processPayment(Long billId, String paymentMethod) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        if ("PAID".equals(bill.getPaymentStatus())) {
            throw new IllegalStateException("Bill is already paid");
        }

        bill.setPaymentStatus("PAID");
        bill.setPaymentMethod(paymentMethod);
        bill.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        bill.setPaidDate(LocalDate.now());

        Bill updated = billRepository.save(bill);
        return toDTO(updated);
    }

    // --- Mapping helpers ---

    private BillDTO toDTO(Bill bill) {
        BillDTO dto = new BillDTO();
        dto.setBillId(bill.getBillId());
        dto.setPatientId(bill.getPatient().getPatientId());
        dto.setPatientName(bill.getPatient().getPatientName());
        if (bill.getAppointment() != null) {
            dto.setAppointmentId(bill.getAppointment().getAppointmentId());
        }
        dto.setAmount(bill.getAmount());
        dto.setPaymentStatus(bill.getPaymentStatus());
        dto.setBillingDate(bill.getBillingDate());
        dto.setPaymentMethod(bill.getPaymentMethod());
        dto.setTransactionId(bill.getTransactionId());
        dto.setPaidDate(bill.getPaidDate());
        dto.setDescription(bill.getDescription());
        return dto;
    }

    private Bill toEntity(BillDTO dto, Patient patient, Appointment appointment) {
        Bill bill = new Bill();
        bill.setPatient(patient);
        bill.setAppointment(appointment);
        bill.setAmount(dto.getAmount());
        bill.setPaymentStatus(dto.getPaymentStatus());
        bill.setBillingDate(dto.getBillingDate());
        bill.setDescription(dto.getDescription());
        return bill;
    }
}

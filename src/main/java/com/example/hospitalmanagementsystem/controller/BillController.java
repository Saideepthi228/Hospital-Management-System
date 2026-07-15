package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.dto.BillDTO;
import com.example.hospitalmanagementsystem.service.BillService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bills")
public class BillController {

    @Autowired
    private BillService billService;

    // Add Bill
    @PostMapping
    public ResponseEntity<BillDTO> addBill(@Valid @RequestBody BillDTO billDTO) {
        BillDTO saved = billService.saveBill(billDTO);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Get All Bills
    @GetMapping
    public ResponseEntity<List<BillDTO>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    // Get Bill By ID
    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    // Update Bill
    @PutMapping("/{id}")
    public ResponseEntity<BillDTO> updateBill(@PathVariable Long id,
                                              @Valid @RequestBody BillDTO billDTO) {
        BillDTO updated = billService.updateBill(id, billDTO);
        return ResponseEntity.ok(updated);
    }

    // Delete Bill
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }

    // Get Bills by Patient ID
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BillDTO>> getBillsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(billService.getBillsByPatient(patientId));
    }
}

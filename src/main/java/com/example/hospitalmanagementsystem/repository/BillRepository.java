package com.example.hospitalmanagementsystem.repository;

import com.example.hospitalmanagementsystem.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByPatientPatientId(Long patientId);
}

package com.example.hospitalmanagementsystem.repository;

import com.example.hospitalmanagementsystem.entity.TelemedicineSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelemedicineRepository extends JpaRepository<TelemedicineSession, Long> {
    List<TelemedicineSession> findByDoctorDoctorId(Long doctorId);
    List<TelemedicineSession> findByPatientPatientId(Long patientId);
    Optional<TelemedicineSession> findByRoomCode(String roomCode);
    List<TelemedicineSession> findByStatus(String status);
}

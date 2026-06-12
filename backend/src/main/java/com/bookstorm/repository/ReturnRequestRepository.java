package com.bookstorm.repository;

import com.bookstorm.model.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    Page<ReturnRequest> findByUserId(Long userId, Pageable pageable);

    List<ReturnRequest> findByOrderId(Long orderId);

    Page<ReturnRequest> findByStatus(ReturnRequest.Status status, Pageable pageable);
}

package com.asu.sundevilcafeteria.repository;

import com.asu.sundevilcafeteria.model.Order;
import com.asu.sundevilcafeteria.model.OrderStatus;
import com.asu.sundevilcafeteria.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByCustomer(User customer);
    
    List<Order> findByStatus(OrderStatus status);
    
    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);
    
    List<Order> findByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.status IN :statuses AND o.createdAt >= :since ORDER BY o.createdAt ASC")
    List<Order> findActiveOrdersSince(List<OrderStatus> statuses, LocalDateTime since);
} 
package com.asu.sundevilcafeteria.service;

import com.asu.sundevilcafeteria.dto.OrderDto;
import com.asu.sundevilcafeteria.dto.OrderItemDto;
import com.asu.sundevilcafeteria.model.*;
import com.asu.sundevilcafeteria.repository.OrderRepository;
import com.asu.sundevilcafeteria.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private MenuItemService menuItemService;
    
    @Autowired
    private UserService userService;
    
    public Order createOrder(Long customerId, OrderDto orderDto) {
        User customer = userService.getUserById(customerId);
        
        // Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemDto itemDto : orderDto.getItems()) {
            MenuItem menuItem = menuItemService.getMenuItemById(itemDto.getMenuItemId());
            
            if (!menuItem.getAvailable()) {
                throw new RuntimeException("Menu item is not available: " + menuItem.getName());
            }
            
            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        
        // Create order
        Order order = new Order(customer, totalAmount);
        order.setSpecialInstructions(orderDto.getSpecialInstructions());
        order = orderRepository.save(order);
        
        // Create order items
        for (OrderItemDto itemDto : orderDto.getItems()) {
            MenuItem menuItem = menuItemService.getMenuItemById(itemDto.getMenuItemId());
            
            OrderItem orderItem = new OrderItem(order, menuItem, itemDto.getQuantity(), menuItem.getPrice());
            orderItem.setSpecialInstructions(itemDto.getSpecialInstructions());
            orderItems.add(orderItem);
        }
        
        orderItemRepository.saveAll(orderItems);
        order.setOrderItems(orderItems);
        
        return order;
    }
    
    public List<Order> getOrdersByCustomer(Long customerId) {
        User customer = userService.getUserById(customerId);
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }
    
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getActiveOrders() {
        List<OrderStatus> activeStatuses = Arrays.asList(
            OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY
        );
        return orderRepository.findByStatusInOrderByCreatedAtAsc(activeStatuses);
    }
    
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }
    
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public List<Order> getTodaysOrders() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return orderRepository.findByCreatedAtBetween(startOfDay, endOfDay);
    }
} 
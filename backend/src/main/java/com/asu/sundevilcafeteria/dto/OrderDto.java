package com.asu.sundevilcafeteria.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class OrderDto {
    
    @NotNull(message = "Order items are required")
    @Size(min = 1, message = "At least one item is required")
    private List<OrderItemDto> items;
    
    private String specialInstructions;
    
    // Constructors
    public OrderDto() {}
    
    public OrderDto(List<OrderItemDto> items, String specialInstructions) {
        this.items = items;
        this.specialInstructions = specialInstructions;
    }
    
    // Getters and Setters
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
} 
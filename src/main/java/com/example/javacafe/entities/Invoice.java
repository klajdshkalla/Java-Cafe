package com.example.javacafe.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;
    private Long totalAmount;

    @ElementCollection
    private List<OrderItem> products;

    private Integer quantity;

    public void setProducts(List<OrderItem> orderItems) {
        this.products = orderItems;
        this.totalAmount = (long) calculateTotalAmount(orderItems);
    }

    private double calculateTotalAmount(List<OrderItem> orderItems) {
        return orderItems.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
    }
}
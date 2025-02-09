package com.example.javacafe.entities;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class OrderItem {
    private String name;
    private double price;
    private int quantity;
}

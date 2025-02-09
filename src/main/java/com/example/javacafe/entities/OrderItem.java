package com.example.javacafe.entities;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class OrderItem {
    private String name;
    private Long price;
    private int quantity;
}

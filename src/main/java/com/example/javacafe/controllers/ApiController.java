package com.example.javacafe.controllers;

import com.example.javacafe.entities.Product;
import com.example.javacafe.enums.Category;
import com.example.javacafe.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private ProductService productService;

    // Endpoint to fetch all categories
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return Arrays.stream(Category.values())
                .map(Enum::name) // Convert enum values to their string representation
                .toList();
    }

    // Endpoint to fetch products by category
    @GetMapping("/products/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        try {
            // Convert the string to the Category enum
            Category cat = Category.valueOf(category.toUpperCase().replace(" ", "_"));
            // Fetch products by category from the service
            return productService.findByCategory(cat);
        } catch (IllegalArgumentException e) {
            // Handle invalid category names gracefully
            throw new RuntimeException("Invalid category: " + category);
        }
    }
}
package com.example.javacafe.services;

import com.example.javacafe.entities.Product;
import com.example.javacafe.enums.Category;
import com.example.javacafe.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Fetch all products
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    // Fetch products by category
    public List<Product> findByCategory(Category category) {
        return productRepository.findByCategory(category);
    }

    // Save a product
    public void save(Product product) {
        productRepository.save(product);
    }

    // Find a product by ID
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    // Delete a product by ID
    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    // Find a product by name
    public Product findByName(String name) {
        return productRepository.findByName(name); // Call the repository method
    }
}
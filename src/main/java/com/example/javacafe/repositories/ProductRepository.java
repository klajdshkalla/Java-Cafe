package com.example.javacafe.repositories;

import com.example.javacafe.entities.Product;
import com.example.javacafe.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Category category);
    Product findByName(String name);
}

package com.example.javacafe.controllers;

import com.example.javacafe.entities.Product;
import com.example.javacafe.enums.Category;
import com.example.javacafe.services.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin/products")
@Secured("ROLE_ADMIN")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Display all products
    @GetMapping
    public String getAllProducts(Model model) {
        model.addAttribute("products", productService.findAll());
        model.addAttribute("categories", Category.values()); // Pass categories to the view
        return "products";
    }

    // Show form to create a new product
    @GetMapping("/new")
    public String showProductForm(Model model) {
        model.addAttribute("product", new Product());
        model.addAttribute("categories", Category.values()); // Pass categories to the form
        return "create_product";
    }

    // Save a new product
    @PostMapping
    public String createProduct(@ModelAttribute("product") @Valid Product product, BindingResult result, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", Category.values()); // Ensure categories are available on errors
            return "create_product";
        }
        productService.save(product);
        return "redirect:/admin/products";
    }

    // Show form to edit an existing product
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Long id, Model model) {
        Product product = productService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid product Id: " + id));
        model.addAttribute("product", product);
        model.addAttribute("categories", Category.values()); // Pass categories to the form
        return "create_product";
    }

    // Update an existing product
    @PostMapping("/update/{id}")
    public String updateProduct(@PathVariable("id") Long id, @ModelAttribute("product") @Valid Product product, BindingResult result, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", Category.values()); // Ensure categories are available on errors
            return "create_product";
        }
        productService.save(product);
        return "redirect:/admin/products";
    }

    // Delete a product
    @GetMapping("/delete/{id}")
    public String deleteProduct(@PathVariable("id") Long id) {
        productService.deleteById(id);
        return "redirect:/admin/products";
    }
}
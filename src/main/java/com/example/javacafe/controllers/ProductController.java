package com.example.javacafe.controllers;

import com.example.javacafe.entities.Product;
import com.example.javacafe.enums.Category;
import com.example.javacafe.services.ProductService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.UUID;

@Controller
@RequestMapping("/admin/products")
@Secured("ROLE_ADMIN")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);
    private static final String REDIRECT_PRODUCTS = "redirect:/admin/products";
    private static final String CREATE_PRODUCT_VIEW = "create_product";

    private final ProductService productService;

    @Value("${app.upload.dir:src/main/resources/static/images/products/}")
    private String uploadDir;

    @Value("${app.allowed.file.types:image/jpeg,image/png,image/gif}")
    private String[] allowedFileTypes;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/update/{id}")
    public String updateProduct(@PathVariable("id") Long id,
                                @ModelAttribute("product") @Valid Product product,
                                @RequestParam(value = "image", required = false) MultipartFile file,
                                BindingResult result,
                                Model model,
                                RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            addCategoriesToModel(model);
            return CREATE_PRODUCT_VIEW;
        }

        try {
            Product existingProduct = productService.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid product Id: " + id));

            updateProductDetails(existingProduct, product);

            if (file != null && !file.isEmpty()) {
                validateFileType(file);
                String imagePath = saveImage(file);
                existingProduct.setImagePath(imagePath);
            }

            productService.save(existingProduct);
            redirectAttributes.addFlashAttribute("success", "Product updated successfully");
            return REDIRECT_PRODUCTS;

        } catch (IOException e) {
            logger.error("Error updating product: ", e);
            redirectAttributes.addFlashAttribute("error", "Failed to update product: " + e.getMessage());
            return REDIRECT_PRODUCTS;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid product update request: ", e);
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return REDIRECT_PRODUCTS;
        }
    }

    @GetMapping
    public String getAllProducts(Model model) {
        addCategoriesToModel(model);
        model.addAttribute("products", productService.findAll());
        return "products";
    }

    @GetMapping("/new")
    public String showProductForm(Model model) {
        addCategoriesToModel(model);
        model.addAttribute("product", new Product());
        return CREATE_PRODUCT_VIEW;
    }

    @DeleteMapping("/delete/{id}")
    public String deleteProduct(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        try {
            productService.deleteById(id);
            redirectAttributes.addFlashAttribute("success", "Product deleted successfully");
        } catch (IllegalArgumentException e) {
            logger.error("Invalid product deletion request: ", e);
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return REDIRECT_PRODUCTS;
    }

    @PostMapping
    public String createProduct(@ModelAttribute("product") @Valid Product product,
                                @RequestParam("image") MultipartFile file,
                                BindingResult result,
                                Model model,
                                RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            addCategoriesToModel(model);
            return CREATE_PRODUCT_VIEW;
        }

        try {
            if (!file.isEmpty()) {
                validateFileType(file);
                String imagePath = saveImage(file);
                product.setImagePath(imagePath);
            }

            productService.save(product);
            redirectAttributes.addFlashAttribute("success", "Product created successfully");
            return REDIRECT_PRODUCTS;

        } catch (IOException e) {
            logger.error("Error creating product: ", e);
            redirectAttributes.addFlashAttribute("error", "Failed to create product: " + e.getMessage());
            return REDIRECT_PRODUCTS;
        }
    }

    private void addCategoriesToModel(Model model) {
        model.addAttribute("categories", Category.values());
    }

    private void updateProductDetails(Product existingProduct, Product updatedProduct) {
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setCategory(updatedProduct.getCategory());
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !Arrays.asList(allowedFileTypes).contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: " + String.join(", ", allowedFileTypes));
        }
    }

    private String saveImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/images/products/" + fileName;
        } catch (IOException e) {
            logger.error("Failed to save image: ", e);
            throw new IOException("Failed to save image: " + e.getMessage());
        }
    }
}
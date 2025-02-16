package com.example.javacafe.controllers;

import com.example.javacafe.entities.Invoice;
import com.example.javacafe.entities.OrderItem;
import com.example.javacafe.services.InvoiceService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import static java.lang.String.format;

@Controller
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/new")
    public String showCreateOrderForm(Model model) {
        // Optionally, add any necessary data to the model (e.g., categories)
        return "create_order";
    }

    @PostMapping
    public String createOrder(@RequestParam("products") String orderItemsJson, Model model) {
        List<OrderItem> orderItems = parseOrderItems(orderItemsJson);
        if (orderItems == null || orderItems.isEmpty()) {
            model.addAttribute("error", "Invalid or empty order items");
            return "create_order";
        }

        double totalAmount = 0.0; // Use double for precision
        for (OrderItem orderItem : orderItems) {
            totalAmount += orderItem.getPrice() * orderItem.getQuantity();
        }

        Invoice invoice = new Invoice();
        invoice.setProducts(orderItems);
        invoice.setTotalAmount(totalAmount); // No casting needed
        invoice.setTimestamp(LocalDateTime.now());
        invoiceService.save(invoice);

        saveInvoiceAsTxtInBackground(invoice); // Call the async method

        return "redirect:/invoices/view/" + invoice.getId();
    }

    private List<OrderItem> parseOrderItems(String orderItemsJson) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(orderItemsJson, new TypeReference<List<OrderItem>>() {});
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Async
    public void saveInvoiceAsTxtInBackground(Invoice invoice) {
        String directoryPath = "C:\\kshjava\\Java-Cafe\\src\\main\\invoicestxt";
        String fileName = format("invoice_%s.txt", invoice.getTimestamp().toString().replace(':', '-'));
        String filePath = directoryPath + "\\" + fileName;

        ensureDirectoryExists(directoryPath);

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            writer.write("Invoice - " + invoice.getTimestamp() + "\n\n");
            writer.write("Products:\n");
            for (int i = 0; i < invoice.getProducts().size(); i++) {
                OrderItem item = invoice.getProducts().get(i);
                writer.write(format("%d. %s - %d x %.2f ALL = %.2f ALL\n",
                        i + 1,
                        item.getName(),
                        item.getQuantity(),
                        item.getPrice(), // No casting needed
                        item.getPrice() * item.getQuantity())); // No casting needed
            }
            writer.write("\nTotal Amount: %.2f ALL\n".formatted(invoice.getTotalAmount()));
        } catch (IOException e) {
            System.err.println("Failed to save invoice file: " + e.getMessage());
        }
    }

    private void ensureDirectoryExists(String directoryPath) {
        File directory = new File(directoryPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }
}
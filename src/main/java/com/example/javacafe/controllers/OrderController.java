package com.example.javacafe.controllers;

import com.example.javacafe.entities.Invoice;
import com.example.javacafe.entities.OrderItem;
import com.example.javacafe.services.InvoiceService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private InvoiceService invoiceService;

    /**
     * Submit a new order and generate an invoice.
     */
    @PostMapping
    public String createOrder(@RequestParam("products") String orderItemsJson, Model model) {
        // Parse the order items from JSON
        List<OrderItem> orderItems = parseOrderItems(orderItemsJson);
        if (orderItems == null || orderItems.isEmpty()) {
            model.addAttribute("error", "Invalid or empty order items");
            return "create_order";
        }

        // Validate and calculate the total amount
        double totalAmount = 0;
        for (OrderItem orderItem : orderItems) {
            totalAmount += orderItem.getPrice() * orderItem.getQuantity();
        }

        // Create and save the invoice
        Invoice invoice = new Invoice();
        invoice.setProducts(orderItems);
        invoice.setTotalAmount((long) totalAmount);
        invoice.setTimestamp(LocalDateTime.now());
        invoiceService.save(invoice);

        // Save the invoice as a .txt file in the background
        saveInvoiceAsTxtInBackground(invoice);

        // Redirect to the invoice details page
        return "redirect:/invoices/view/" + invoice.getId();
    }

    /**
     * Helper method to parse order items from JSON.
     */
    private List<OrderItem> parseOrderItems(String orderItemsJson) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(orderItemsJson, new TypeReference<List<OrderItem>>() {});
        } catch (Exception e) {
            e.printStackTrace();
            return null; // Return null if parsing fails
        }
    }

    /**
     * Helper method to save the invoice as a .txt file in the background.
     */
    private void saveInvoiceAsTxtInBackground(Invoice invoice) {
        // Use a separate thread to save the file in the background
        new Thread(() -> {
            String directoryPath = "C:\\kshjava\\Java-Cafe\\src\\main\\invoicestxt";
            String fileName = String.format("invoice_%s.txt", invoice.getTimestamp().toString().replace(':', '-'));
            String filePath = directoryPath + "\\" + fileName;

            try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
                writer.write("Invoice - " + invoice.getTimestamp() + "\n\n");
                writer.write("Products:\n");

                for (int i = 0; i < invoice.getProducts().size(); i++) {
                    OrderItem item = invoice.getProducts().get(i);
                    writer.write(String.format("%d. %s - %d x %.2f ALL = %.2f ALL\n",
                            i + 1, item.getName(), item.getQuantity(), item.getPrice(), item.getPrice() * item.getQuantity()));
                }

                writer.write("\nTotal Amount: " + invoice.getTotalAmount() + " ALL\n");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
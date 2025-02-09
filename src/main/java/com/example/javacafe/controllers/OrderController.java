package com.example.javacafe.controllers;

import com.example.javacafe.entities.Invoice;
import com.example.javacafe.entities.Order;
import com.example.javacafe.entities.OrderItem;
import com.example.javacafe.entities.Product;
import com.example.javacafe.services.InvoiceService;
import com.example.javacafe.services.OrderService;
import com.example.javacafe.services.ProductService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @GetMapping("/new")
    public String showOrderForm(Model model) {
        Order order = new Order();
        model.addAttribute("order", order);
        model.addAttribute("products", productService.findAll());
        return "create_order";
    }

    @PostMapping
    public String createOrder(@ModelAttribute("order") Order order, Model model) {
        // Save the order
        orderService.save(order);

        // Parse the product list from the order items
        List<OrderItem> orderItems = parseOrderItems(order.getProduct());
        if (orderItems == null) {
            model.addAttribute("error", "Invalid order items");
            return "create_order";
        }

        // Calculate the total amount
        double totalAmount = 0;
        for (OrderItem orderItem : orderItems) {
            Product product = productService.findByName(orderItem.getName());
            if (product == null) {
                model.addAttribute("error", "Product not found: " + orderItem.getName());
                return "create_order";
            }
            totalAmount += product.getPrice() * orderItem.getQuantity();
        }

        // Create an invoice
        Invoice invoice = new Invoice();
        invoice.setProducts(orderItems);
        invoice.setTotalAmount((long) totalAmount);
        invoice.setTimestamp(LocalDateTime.now());
        invoiceService.save(invoice);

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
}
package com.example.javacafe;

import com.example.javacafe.entities.Invoice;
import com.example.javacafe.services.InvoiceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
public class InvoiceServiceTest {

    @Autowired
    private InvoiceService invoiceService;

    @Test
    public void testFindAllInvoices() {
        List<Invoice> invoices = invoiceService.findAll();
        assertNotNull(invoices);
        assertFalse(invoices.isEmpty());
    }
}
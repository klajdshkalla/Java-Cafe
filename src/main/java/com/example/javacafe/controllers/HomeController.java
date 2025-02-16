package com.example.javacafe.controllers;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/default")
    public String defaultAfterLogin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (role.equals("ROLE_ADMIN")) {
            return "redirect:/admin/dashboard";
        }
        return "redirect:/waiter/dashboard";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "admin_dashboard";
    }

    @GetMapping("/waiter/dashboard")
    public String waiterDashboard() {
        return "waiter_dashboard";
    }
}
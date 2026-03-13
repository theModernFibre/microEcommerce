package com.microshop.order.controller;

import com.microshop.order.dto.CreateOrderRequest;
import com.microshop.order.entity.Order;
import com.microshop.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.create(request));
    }

    @GetMapping
    public List<Order> list(@RequestParam(required = false) String userEmail) {
        if (userEmail != null && !userEmail.isBlank())
            return orderService.findByUser(userEmail.trim());
        return orderService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        return orderService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

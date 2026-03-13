package com.microshop.order.service;

import com.microshop.order.dto.CreateOrderRequest;
import com.microshop.order.entity.Order;
import com.microshop.order.entity.OrderItem;
import com.microshop.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order create(CreateOrderRequest req) {
        Order order = new Order();
        order.setUserEmail(req.userEmail());
        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemDto dto : req.items()) {
            OrderItem item = new OrderItem();
            item.setProductId(dto.productId());
            item.setProductName(dto.productName());
            item.setQuantity(dto.quantity());
            item.setUnitPrice(dto.unitPrice());
            order.getItems().add(item);
            total = total.add(dto.unitPrice().multiply(BigDecimal.valueOf(dto.quantity())));
        }
        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    public List<Order> findByUser(String userEmail) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    public java.util.Optional<Order> getById(Long id) {
        return orderRepository.findById(id);
    }
}

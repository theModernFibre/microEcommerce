package com.microshop.order.dto;

import java.util.List;

public record CreateOrderRequest(String userEmail, List<OrderItemDto> items) {
    public record OrderItemDto(Long productId, String productName, int quantity, java.math.BigDecimal unitPrice) {}
}

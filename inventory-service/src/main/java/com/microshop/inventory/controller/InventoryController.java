package com.microshop.inventory.controller;

import com.microshop.inventory.entity.Stock;
import com.microshop.inventory.repository.StockRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping
public class InventoryController {

    private final StockRepository stockRepository;

    public InventoryController(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @GetMapping
    public List<Stock> getAll() {
        return stockRepository.findAll();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Stock> getByProductId(@PathVariable Long productId) {
        return stockRepository.findByProductId(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Stock create(@RequestBody Stock stock) {
        return stockRepository.save(stock);
    }

    @PutMapping("/{id}/quantity")
    public ResponseEntity<Stock> updateQuantity(@PathVariable Long id, @RequestBody QuantityUpdate update) {
        return stockRepository.findById(id)
                .map(s -> {
                    s.setQuantity(update.quantity());
                    return ResponseEntity.ok(stockRepository.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.microshop.auth.service;

import com.microshop.auth.dto.AuthResponse;
import com.microshop.auth.dto.LoginRequest;
import com.microshop.auth.dto.RegisterRequest;
import com.microshop.auth.entity.User;
import com.microshop.auth.repository.UserRepository;
import com.microshop.auth.config.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email()))
            throw new IllegalArgumentException("Email already registered");
        User user = new User();
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setName(req.name() != null ? req.name() : req.email());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getName());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(req.password(), user.getPassword()))
            throw new IllegalArgumentException("Invalid email or password");
        String token = jwtUtil.generateToken(user.getEmail(), user.getName());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }
}

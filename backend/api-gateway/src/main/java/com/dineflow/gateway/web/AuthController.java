package com.dineflow.gateway.web;

import com.dineflow.gateway.config.AppProperties;
import com.dineflow.gateway.web.LoginRequest;
import com.dineflow.gateway.web.LoginResponse;
import com.dineflow.gateway.web.InvalidCredentialsException;
import com.dineflow.gateway.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Admin login. On success returns a JWT the downstream services will validate. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppProperties properties;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(AppProperties properties, JwtService jwtService) {
        this.properties = properties;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        // Always run the (expensive) hash check so a wrong username and a wrong
        // password take the same time — avoids leaking which one was wrong.
        boolean passwordMatches =
                passwordEncoder.matches(request.password(), properties.admin().passwordHash());
        boolean usernameMatches = properties.admin().username().equals(request.username());
        if (!usernameMatches || !passwordMatches) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        String token = jwtService.issueToken(request.username());
        return new LoginResponse(token, "Bearer", jwtService.getExpiresInSeconds(), request.username());
    }
}

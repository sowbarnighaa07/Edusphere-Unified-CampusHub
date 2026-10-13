package com.edusphere.controller;

import com.edusphere.dto.auth.AuthResponse;
import com.edusphere.dto.auth.LoginRequest;
import com.edusphere.dto.auth.StudentRegistrationRequest;
import com.edusphere.dto.auth.UserSummaryDto;
import com.edusphere.dto.common.ApiResponse;
import com.edusphere.security.UserPrincipal;
import com.edusphere.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserSummaryDto>> registerStudent(@Valid @RequestBody StudentRegistrationRequest registrationRequest) {
        UserSummaryDto response = authService.registerStudent(registrationRequest);
        return ResponseEntity.ok(ApiResponse.success("Registration submitted successfully. Pending Admin approval.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserSummaryDto response = authService.getCurrentUser(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

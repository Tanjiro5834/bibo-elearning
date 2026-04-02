package com.bibo.elearning.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private String username;
    private String role;
}
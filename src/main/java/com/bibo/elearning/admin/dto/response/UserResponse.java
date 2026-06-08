package com.bibo.elearning.admin.dto.response;

import com.bibo.elearning.auth.user.entity.User;
import lombok.Getter;

@Getter
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String role;
    private boolean enabled;

    public UserResponse(User u) {
        this.id = u.getId();
        this.firstName = u.getFirstName();
        this.lastName = u.getLastName();
        this.username = u.getUsername();
        this.email = u.getEmail();
        this.role = u.getRole().getName().name(); // enum → String
        this.enabled = u.isEnabled();
    }
}
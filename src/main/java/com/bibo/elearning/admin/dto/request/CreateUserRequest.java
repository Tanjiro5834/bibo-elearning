package com.bibo.elearning.admin.dto.request;

import com.bibo.elearning.auth.common.enums.RoleName;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateUserRequest {
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String password;
    private RoleName role;
}
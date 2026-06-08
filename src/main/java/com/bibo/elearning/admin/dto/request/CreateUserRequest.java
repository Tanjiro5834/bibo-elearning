package com.bibo.elearning.admin.dto.request;

import com.bibo.elearning.auth.common.enums.RoleName;
import java.util.List;
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

    private List<ChildRequest> children;

    @Getter @Setter
    public static class ChildRequest {
        private String firstName;
        private String lastName;
        private String username;
        private String email;
        private String password;
        private Integer age;
        private String grade;
        private String school;
    }
}
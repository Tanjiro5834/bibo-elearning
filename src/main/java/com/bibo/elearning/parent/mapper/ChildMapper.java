package com.bibo.elearning.parent.mapper;

import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.parent.dto.response.ChildResponse;

public class ChildMapper {
    public ChildResponse toChildResponse(User child) {
        return ChildResponse.builder()
            .childId(child.getId())
            .username(child.getUsername())
            .firstName(null)  // User entity doesn't have this field
            .lastName(null)   // User entity doesn't have this field
            .age(null)        // User entity doesn't have this field
            .grade(null)      // User entity doesn't have this field
            .school(null)     // User entity doesn't have this field
            .build();
    }
}

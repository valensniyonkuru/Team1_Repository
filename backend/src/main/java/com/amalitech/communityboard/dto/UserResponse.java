package com.amalitech.communityboard.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String role;
    private String authProvider;
    private boolean emailVerified;
    private LocalDateTime createdAt;
}

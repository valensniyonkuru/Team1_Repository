package com.amalitech.communityboard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ResendVerificationRequest {

    @Email
    @NotBlank
    private String email;
}

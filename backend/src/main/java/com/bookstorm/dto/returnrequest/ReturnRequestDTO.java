package com.bookstorm.dto.returnrequest;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestDTO {

    @NotBlank(message = "Reason is required")
    private String reason;

    private String description;
}

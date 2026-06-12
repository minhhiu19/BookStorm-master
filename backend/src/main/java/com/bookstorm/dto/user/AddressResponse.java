package com.bookstorm.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String province;
    private String district;
    private String ward;
    private String addressDetail;
    private boolean isDefault;
}

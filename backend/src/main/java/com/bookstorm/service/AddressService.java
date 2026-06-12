package com.bookstorm.service;

import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Address;
import com.bookstorm.model.User;
import com.bookstorm.repository.AddressRepository;
import com.bookstorm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public Address addAddress(Long userId, Address address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        address.setUser(user);

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            unsetDefaultAddresses(userId);
        }

        // If this is the first address, make it default
        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        if (existingAddresses.isEmpty()) {
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long addressId, Address updatedData) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (updatedData.getFullName() != null) {
            address.setFullName(updatedData.getFullName());
        }
        if (updatedData.getPhone() != null) {
            address.setPhone(updatedData.getPhone());
        }
        if (updatedData.getProvince() != null) {
            address.setProvince(updatedData.getProvince());
        }
        if (updatedData.getDistrict() != null) {
            address.setDistrict(updatedData.getDistrict());
        }
        if (updatedData.getWard() != null) {
            address.setWard(updatedData.getWard());
        }
        if (updatedData.getAddressDetail() != null) {
            address.setAddressDetail(updatedData.getAddressDetail());
        }

        if (Boolean.TRUE.equals(updatedData.getIsDefault())) {
            unsetDefaultAddresses(address.getUser().getId());
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        addressRepository.delete(address);
    }

    @Transactional
    public Address setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        unsetDefaultAddresses(userId);
        address.setIsDefault(true);
        return addressRepository.save(address);
    }

    private void unsetDefaultAddresses(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(defaultAddress -> {
                    defaultAddress.setIsDefault(false);
                    addressRepository.save(defaultAddress);
                });
    }
}

package com.example.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class UserDto {

    public UUID id;
    public String username;
    public String name;
    public String email;
    public String password;
    public LocalDate dateOfBirth;
    public String document;
    public String phone;
    public LocalDateTime createdAt = LocalDateTime.now();
}

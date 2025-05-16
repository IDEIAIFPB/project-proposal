package com.example.repository;

import com.example.entity.User;

import java.util.UUID;

public interface UserRepo {
    User findById(UUID id);

    Void deleteById(UUID id);
}

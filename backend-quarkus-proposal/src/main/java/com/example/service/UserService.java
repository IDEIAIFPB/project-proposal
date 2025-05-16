package com.example.service;

import com.example.dto.UserDto;
import com.example.entity.User;
import com.example.exceptions.CustomException;
import com.example.mapper.UserMapper;
import com.example.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.HashSet;
import java.util.stream.Collectors;

import static com.example.exceptions.CustomException.ErrorType.NOT_FOUND;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    UserMapper userMapper;

    public List<UserDto> getAll(){
        return userRepository.listAll().stream()
                .map(userMapper::toDto)
                .toList();
    }

    @Transactional
    public UserDto post(UserDto userDto) {
        User user = userMapper.toEntity(userDto);
        userRepository.persist(user);
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto update(UUID id, Map<String, Object> updates) {
        User existingUser = userRepository.findById(id);
        if (existingUser == null) {
            throw new CustomException("User not found", NOT_FOUND, String.valueOf(404));

        }
        updateFields(existingUser, updates);


        // only tests populated fields
        // by using the method validateProperty
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        Set<ConstraintViolation<User>> violations = new HashSet<>();

        for (String field : updates.keySet()) {
            violations.addAll(validator.validateProperty(existingUser, field));
        }

        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        userRepository.persist(existingUser);
        return userMapper.toDto(existingUser);
    }

    private void updateFields(User user, Map<String, Object> updates) {

        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String fieldName = entry.getKey();
            Object value = entry.getValue();

            switch (fieldName) {
                case "username":
                    user.username = (String) value;
                    break;
                case "name":
                    user.name = (String) value;
                    break;
                case "email":
                    user.email = (String) value;
                    break;
                case "dateOfBirth":
                    if (value instanceof String) {
                        user.dateOfBirth = java.time.LocalDate.parse((String) value);
                    } else if (value instanceof java.time.LocalDate) {
                        user.dateOfBirth = (java.time.LocalDate) value;
                    }
                    break;
                case "document":
                    user.document = (String) value;
                    break;
                case "phone":
                    user.phone = (String) value;
                    break;
                case "password":
                    user.password = (String) value;
                    break;
            }
        }

    }

    public UserDto get(UUID id) {

        User existingUser = userRepository.findById(id);
        if (existingUser == null) {
            throw new CustomException("User not found", NOT_FOUND, String.valueOf(404));
        }

        return userMapper.toDto(existingUser);
    }

    @Transactional
    public void delete(UUID id) {

        get(id);

        userRepository.deleteById(id);
    }
}


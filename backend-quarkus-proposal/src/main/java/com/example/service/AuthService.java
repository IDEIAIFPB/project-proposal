package com.example.service;

import com.example.entity.User;
import com.example.exceptions.CustomException;
import com.example.mapper.UserMapper;
import com.example.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;
import org.eclipse.microprofile.jwt.Claims;

import static com.example.exceptions.CustomException.ErrorType.NOT_FOUND;
import static com.example.exceptions.CustomException.ErrorType.UNAUTHORIZED;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    UserMapper userMapper;

    public String login(String email, String password) {

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new CustomException("User not found", NOT_FOUND, String.valueOf(404));
        }

        if (!BcryptUtil.matches(password, user.password)) {
            throw new CustomException("Invalid password", UNAUTHORIZED, String.valueOf(401));
        }

        return Jwt.issuer("http://localhost:8080").upn(user.email).sign();
    }
}


package com.example.entity;

import com.example.validations.Adult;
import com.example.validations.CreateValidationGroup;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.validation.constraints.NotNull;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "app_user")
public class User extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    public UUID id;

    @Column(unique = true, nullable = false)
    public String username;

    @Column(nullable = false)
    public String name;

    @Column(unique = true, nullable = false)
    public String email;

    @Column(nullable = false)
    public String password;

    @Column(name = "date_of_birth", nullable = false)
    @NotNull(message = "date of birth can't be null.", groups = CreateValidationGroup.class)
    @Adult
    public LocalDate dateOfBirth;

    public String document;

    public String phone;

    @Column(name = "created_at", updatable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}

package com.example.repository;

import com.example.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User>, UserRepo {

    @Inject
    EntityManager em;

    @Override
    public User findById(UUID id) {
        return em.find(User.class, id);
    }

    @Override
    public Void deleteById(UUID id) {
        User user = em.find(User.class, id);
        if (user != null) {
            em.remove(user);
        }
        return null;
    }
}

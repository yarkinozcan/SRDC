package com.SRDCHW2.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.SRDCHW2.models.User;
import com.SRDCHW2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    public User validateUser(String username, String password) {
        Optional<User> user = Optional.ofNullable(userRepository.findByUsername(username));
        if (user.isPresent()) {
            if (user.get().getPassword().equals(password)) {
                return user.get();
            }
        }
        return null;
    }



    public Page<User> getAllUsers(int page, int size, String field, String value) {
        Pageable pageable = PageRequest.of(page, size);
        if (field != null && value != null) {
            return userRepository.findUsersByFieldAndValue(field, value, pageable);
        } else {
            return userRepository.findAll(pageable);
        }
    }

}

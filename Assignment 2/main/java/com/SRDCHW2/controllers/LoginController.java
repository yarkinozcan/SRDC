package com.SRDCHW2.controllers;

import com.SRDCHW2.models.User;
import com.SRDCHW2.models.loginUser;
import com.SRDCHW2.repository.UserRepository;
import com.SRDCHW2.services.UserService;
import com.SRDCHW2.util.TokenUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    public static final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody loginUser user) {
        User usr = userService.validateUser(user.getUsername(), user.getPassword());
        if(usr != null) {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            String formattedBirthdate = dateFormat.format(usr.getBirthdate());
            String token = Jwts.builder()
                    .setSubject(usr.getUsername())
                    .claim("username", usr.getUsername())
                    .claim("name", usr.getName())
                    .claim("surname", usr.getSurname())
                    .claim("email", usr.getEmail())
                    .claim("address", usr.getAddress())
                    .claim("gender", usr.getGender())
                    .claim("birthdate", formattedBirthdate)
                    .claim("admin", usr.isAdmin())
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiration
                    .signWith(secretKey)
                    .compact();
            TokenUtil.addToken(token);
            return ResponseEntity.ok(token);
        }
        else {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader("Authorization") String authHeader){
        String token = authHeader.substring(7);
        TokenUtil.removeToken(token);
    }
}



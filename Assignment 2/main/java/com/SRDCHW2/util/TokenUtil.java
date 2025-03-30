package com.SRDCHW2.util;

import com.SRDCHW2.controllers.LoginController;
import io.jsonwebtoken.Jwts;

import java.util.ArrayList;
import java.util.List;

import javax.crypto.SecretKey;

public class TokenUtil {

    private static List<String> tokens = new ArrayList<>();

    private static final SecretKey secretKey = LoginController.secretKey;

    public static boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            if(tokens.contains(token)){
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public static void addToken(String token){
        tokens.add(token);
    }

    public static void removeToken(String token){
        tokens.remove(token);
    }

    public static boolean isAdmin(String token) {
        try {
            var claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
            return (boolean) claims.get("admin");
        } catch (Exception e) {
            return false;
        }
    }
}

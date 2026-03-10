package com.amalitech.communityboard.security;

import com.amalitech.communityboard.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.access-token.secret}")
    private String accessTokenSecret;

    @Value("${jwt.access-token.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token.secret}")
    private String refreshTokenSecret;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    public String generateAccessToken(User user) {
        return buildToken(user, accessTokenSecret, accessTokenExpiration, "ACCESS");
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshTokenSecret, refreshTokenExpiration, "REFRESH");
    }

    private String buildToken(User user, String secret, long expiration, String type) {
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("type", type)
                .claim("version", user.getTokenVersion())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(secret))
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token, accessTokenSecret).getSubject();
    }

    public String extractEmailFromRefreshToken(String token) {
        return extractClaims(token, refreshTokenSecret).getSubject();
    }

    public String extractJti(String token) {
        return extractClaims(token, accessTokenSecret).getId();
    }

    public String extractJtiFromRefreshToken(String token) {
        return extractClaims(token, refreshTokenSecret).getId();
    }

    public int extractVersion(String token) {
        return extractClaims(token, accessTokenSecret).get("version", Integer.class);
    }

    public int extractVersionFromRefreshToken(String token) {
        return extractClaims(token, refreshTokenSecret).get("version", Integer.class);
    }

    public long getRemainingMillis(String token) {
        Date expiration = extractClaims(token, accessTokenSecret).getExpiration();
        return expiration.getTime() - System.currentTimeMillis();
    }

    public long getRemainingMillisFromRefreshToken(String token) {
        Date expiration = extractClaims(token, refreshTokenSecret).getExpiration();
        return expiration.getTime() - System.currentTimeMillis();
    }

    public boolean isAccessTokenValid(String token) {
        return isTokenValid(token, accessTokenSecret, "ACCESS");
    }

    public boolean isRefreshTokenValid(String token) {
        return isTokenValid(token, refreshTokenSecret, "REFRESH");
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    private boolean isTokenValid(String token, String secret, String expectedType) {
        try {
            Claims claims = extractClaims(token, secret);
            String type = claims.get("type", String.class);
            return expectedType.equals(type) && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims extractClaims(String token, String secret) {
        return Jwts.parser()
                .setSigningKey(getSigningKey(secret))
                .build()
                .parseClaimsJws(token)
                .getPayload();
    }

    private Key getSigningKey(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}

package com.dineflow.gateway.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Dev utility to generate a BCrypt hash for the admin password, so a plain-text
 * password is never committed. Not part of the running app.
 *
 * <p>Usage: {@code mvn -q exec:java -Dexec.mainClass=com.dineflow.gateway.security.PasswordHashTool -Dexec.args="yourPassword"}
 * (defaults to "admin123"). Put the printed hash in {@code ADMIN_PASSWORD_HASH}.
 */
public final class PasswordHashTool {

    private PasswordHashTool() {
    }

    public static void main(String[] args) {
        String raw = args.length > 0 ? args[0] : "admin123";
        System.out.println(new BCryptPasswordEncoder().encode(raw));
    }
}

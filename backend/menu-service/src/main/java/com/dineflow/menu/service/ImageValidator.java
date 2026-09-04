package com.dineflow.menu.service;

import com.dineflow.menu.domain.InvalidImageException;

/**
 * Decides the real type of an uploaded photo from its leading bytes (the "magic number"),
 * rather than trusting the client-supplied filename or Content-Type. Only raster formats
 * are accepted — SVG is deliberately excluded because it can carry scripts.
 */
final class ImageValidator {

    /** Hard cap on stored image size. Enforced here in addition to the servlet multipart limit. */
    static final long MAX_BYTES = 2 * 1024 * 1024; // 2 MB

    private ImageValidator() {
    }

    /**
     * Validates the bytes and returns the canonical MIME type to store/serve.
     *
     * @throws InvalidImageException if the payload is empty, too large, or not a JPEG/PNG/WebP
     */
    static String detectContentType(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            throw new InvalidImageException("Image file is empty");
        }
        if (bytes.length > MAX_BYTES) {
            throw new InvalidImageException("Image must be 2 MB or smaller");
        }
        if (isJpeg(bytes)) {
            return "image/jpeg";
        }
        if (isPng(bytes)) {
            return "image/png";
        }
        if (isWebp(bytes)) {
            return "image/webp";
        }
        throw new InvalidImageException("Unsupported image type — use JPEG, PNG or WebP");
    }

    private static boolean isJpeg(byte[] b) {
        return b.length >= 3
                && (b[0] & 0xFF) == 0xFF
                && (b[1] & 0xFF) == 0xD8
                && (b[2] & 0xFF) == 0xFF;
    }

    private static boolean isPng(byte[] b) {
        return b.length >= 8
                && (b[0] & 0xFF) == 0x89
                && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                && (b[4] & 0xFF) == 0x0D && (b[5] & 0xFF) == 0x0A
                && (b[6] & 0xFF) == 0x1A && (b[7] & 0xFF) == 0x0A;
    }

    private static boolean isWebp(byte[] b) {
        // "RIFF" .... "WEBP"
        return b.length >= 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
    }
}

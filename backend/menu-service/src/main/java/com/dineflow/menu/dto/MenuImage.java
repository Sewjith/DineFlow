package com.dineflow.menu.dto;

/** A menu item's stored photo, ready to stream back to the browser. */
public record MenuImage(String contentType, byte[] data) {
}

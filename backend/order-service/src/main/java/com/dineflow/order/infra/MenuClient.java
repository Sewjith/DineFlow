package com.dineflow.order.infra;

import com.dineflow.order.domain.UpstreamServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Optional;

/** Reads menu items from menu-service so order totals use real, current prices. */
@Component
public class MenuClient {

    private final RestClient restClient;

    public MenuClient(RestClient.Builder builder,
                      @Value("${menu-service.url:http://localhost:8081}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    /** Returns the menu item, or empty if it does not exist (404). */
    public Optional<MenuItemDto> findItem(Long id) {
        try {
            MenuItemDto item = restClient.get()
                    .uri("/menu-items/{id}", id)
                    .retrieve()
                    .body(MenuItemDto.class);
            return Optional.ofNullable(item);
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        } catch (RestClientException ex) {
            throw new UpstreamServiceException("Menu service is currently unavailable");
        }
    }
}

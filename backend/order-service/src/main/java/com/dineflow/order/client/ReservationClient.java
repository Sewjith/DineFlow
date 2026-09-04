package com.dineflow.order.client;

import com.dineflow.order.exception.UpstreamServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

/** Reads the restaurant's tables from reservation-service so dine-in orders name a real table. */
@Component
public class ReservationClient {

    private static final ParameterizedTypeReference<List<TableDto>> TABLE_LIST =
            new ParameterizedTypeReference<>() {
            };

    private final RestClient restClient;

    public ReservationClient(RestClient.Builder builder,
                             @Value("${reservation-service.url:http://localhost:8083}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    /** True if a table with the given label exists (case-insensitive). */
    public boolean tableExists(String label) {
        try {
            List<TableDto> tables = restClient.get()
                    .uri("/tables")
                    .retrieve()
                    .body(TABLE_LIST);
            return tables != null && tables.stream().anyMatch(t -> t.label().equalsIgnoreCase(label));
        } catch (RestClientException ex) {
            throw new UpstreamServiceException("Reservation service is currently unavailable");
        }
    }
}

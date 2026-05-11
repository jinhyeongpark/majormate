package me.majormate.point.dto;

public record IapWebhookRequest(
        String platform,
        String productId,
        String receiptData,
        String userId
) {
}

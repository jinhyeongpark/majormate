package me.majormate.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AssetUrlService {

    @Value("${asset.base-url}")
    private String baseUrl;

    /** S3 키 경로를 CloudFront 전체 URL로 변환한다. path가 null이면 null 반환. */
    public String toUrl(String path) {
        if (path == null || path.isBlank()) return null;
        return baseUrl + "/" + path;
    }
}

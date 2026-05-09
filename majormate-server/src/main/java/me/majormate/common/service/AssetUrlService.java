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

    /** 전체 URL에서 base-url prefix를 제거해 상대 경로로 변환한다. 이미 상대 경로면 그대로 반환. */
    public String toPath(String url) {
        if (url == null || url.isBlank()) return null;
        String prefix = baseUrl + "/";
        if (url.startsWith(prefix)) return url.substring(prefix.length());
        return url;
    }
}

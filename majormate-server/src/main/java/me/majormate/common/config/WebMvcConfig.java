package me.majormate.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * 개발 환경에서 majormate-app/assets/characters/ 디렉터리를
 * /assets/characters/** 경로로 정적 파일 서빙한다.
 *
 * 프로덕션에서는 asset.base-url이 CDN을 가리키므로 이 핸들러는 CDN이 없을 때만 사용된다.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // classpath:static/assets/characters/ 우선 (배포 시 번들 포함 경로)
        // 그 다음 서버 기준 상대경로 ../majormate-app/assets/characters/ (로컬 개발)
        String appAssetsPath = resolveAppAssetsPath();

        registry.addResourceHandler("/assets/characters/**")
                .addResourceLocations(
                        "classpath:/static/assets/characters/",
                        appAssetsPath
                );
    }

    private String resolveAppAssetsPath() {
        // 실행 위치가 majormate-server/ 또는 majormate-server/build/ 일 수 있으므로
        // 두 후보를 순서대로 확인한다.
        String[] candidates = {
                "../majormate-app/assets/characters/",
                "../../majormate-app/assets/characters/"
        };
        for (String candidate : candidates) {
            File dir = new File(candidate);
            if (dir.exists() && dir.isDirectory()) {
                return "file:" + dir.getAbsolutePath().replace("\\", "/") + "/";
            }
        }
        // 찾지 못하면 첫 번째 후보를 반환 (오류 없이 빈 응답)
        return "file:../majormate-app/assets/characters/";
    }
}

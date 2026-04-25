package me.majormate.major.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.major.dto.MajorResponse;
import me.majormate.major.service.MajorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/majors")
@RequiredArgsConstructor
public class MajorController {

    private final MajorService majorService;

    @GetMapping
    public ResponseEntity<List<MajorResponse>> getAll() {
        return ResponseEntity.ok(majorService.getAll());
    }
}

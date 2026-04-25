package me.majormate.major.service;

import lombok.RequiredArgsConstructor;
import me.majormate.major.dto.MajorResponse;
import me.majormate.major.repository.MajorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MajorService {

    private final MajorRepository majorRepository;

    @Transactional(readOnly = true)
    public List<MajorResponse> getAll() {
        return majorRepository.findAll().stream()
                .map(MajorResponse::from)
                .toList();
    }

    public boolean exists(String nameKo) {
        return majorRepository.existsByNameKo(nameKo);
    }
}

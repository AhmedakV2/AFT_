package com.aft.api.sse;

import com.aft.api.report.ReportService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RunStreamController {

    private final SseRegistry registry;
    private final ReportService reportService;

    @GetMapping("/runs/{testRunId}/stream")
    public SseEmitter stream(@PathVariable UUID testRunId) {
        reportService.runDetail(testRunId);
        return registry.register(testRunId.toString());
    }
}

package com.aft.api.export;

import com.aft.api.report.ReportService;
import com.aft.common.domain.StepResult;
import com.aft.common.repository.StepResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private static final String XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final ExcelExporter excel;
    private final PdfExporter pdf;
    private final ReportService reportService;
    private final StepResultRepository stepResults;

    @PostMapping("/excel/scenarios")
    public ResponseEntity<byte[]> excelScenarios(@RequestBody List<UUID> scenarioIds) {
        var rows = reportService.excelRowsByScenarioIds(scenarioIds);
        return file(excel.export("AFT Test Raporu", rows), "rapor.xlsx", XLSX);
    }

    @PostMapping("/excel/modules")
    public ResponseEntity<byte[]> excelModules(@RequestBody List<UUID> moduleIds) {
        var rows = reportService.excelRowsByModuleIds(moduleIds);
        return file(excel.export("AFT Modül Raporu", rows), "rapor.xlsx", XLSX);
    }

    @GetMapping("/excel/projects/{projectId}")
    public ResponseEntity<byte[]> excelProject(@PathVariable UUID projectId) {
        var rows = reportService.excelRowsByProject(projectId);
        return file(excel.export("AFT Proje Raporu", rows), "rapor.xlsx", XLSX);
    }

    @GetMapping("/runs/{testRunId}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable UUID testRunId) {
        reportService.runDetail(testRunId);
        List<StepResult> results = stepResults.findByTestRun_IdOrderByExecutedAtAsc(testRunId);
        byte[] bytes = pdf.export("Run " + testRunId, results);
        return file(bytes, "rapor-" + testRunId + ".pdf", "application/pdf");
    }

    private ResponseEntity<byte[]> file(byte[] bytes, String name, String contentType) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + name + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
    }
}
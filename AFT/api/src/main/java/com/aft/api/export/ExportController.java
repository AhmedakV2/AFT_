package com.aft.api.export;


import com.aft.api.common.security.SecurityUtils;
import com.aft.api.report.ReportService;
import com.aft.common.domain.StepResult;
import com.aft.common.repository.StepResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;



@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExcelExporter excel;
    private final PdfExporter pdf;
    private final ReportService reportService;
    private final StepResultRepository stepResults;

    @PostMapping("/excel")
    public ResponseEntity<byte[]> excel (@RequestBody List<UUID> scenarioIds) {
        var reports = scenarioIds.stream().map(reportService::scenarioReport).toList();
        byte[] bytes = excel.export(reports);
        return file(bytes, "rapor.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    }

    @GetMapping("/runs/{testRunId}/pdf")
    public ResponseEntity<byte[]> pdf (@PathVariable UUID testRunId) {
        var run = reportService.runDetail(testRunId);
        List<?> results = stepResults.findByTestRun_IdOrderByExecutedAtAsc(testRunId);
        @SuppressWarnings("unchecked")
                byte[] bytes = pdf.export("Run"+testRunId,
                (List<StepResult>) results);
        return file(bytes, "rapor-"+testRunId+".pdf", "application/pdf");
    }

    private ResponseEntity<byte[]> file(byte[] bytes,String name ,String contentType){
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+name+"\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
    }
}

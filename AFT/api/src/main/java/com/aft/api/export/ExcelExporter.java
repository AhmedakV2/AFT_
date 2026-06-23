package com.aft.api.export;

import com.aft.api.report.dto.RunSummary;
import com.aft.api.report.dto.ScenarioReport;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
public class ExcelExporter {
    public byte [] export(List<ScenarioReport> reports) {
        try(Workbook wb = new XSSFWorkbook() ; ByteArrayOutputStream out = new ByteArrayOutputStream()){
            Sheet sheet = wb.createSheet("Rapor");
            Row header = sheet.createRow(0);
            String[] cols =  {"Senaryo ID","Toplam Çalıştırma","Başarılı","Başarılı %","Son Durum"};
            for(int i = 0; i<cols.length; i++){
                header.createCell(i).setCellValue(cols[i]);

                int r = 1;

                for(ScenarioReport rep: reports){
                    Row row = sheet.createRow(r++);

                    row.createCell(0).setCellValue(rep.scenarioId().toString());
                    row.createCell(1).setCellValue(rep.totalRuns());
                    row.createCell(2).setCellValue(rep.passedRuns());
                    row.createCell(3).setCellValue(Math.round(rep.successRate() * 100.0)/100.0);

                    String last = rep.recentRuns().stream().findFirst()
                            .map(RunSummary::status).map(Enum::name).orElse("-");
                    row.createCell(4).setCellValue(last);
                }

            }
            for(int i = 0; i<cols.length; i++) sheet.autoSizeColumn(i);

            wb.write(out);
            return out.toByteArray();

        }catch (Exception e){
        throw new IllegalStateException("Excel üretilmedi",e);
        }
    }
}

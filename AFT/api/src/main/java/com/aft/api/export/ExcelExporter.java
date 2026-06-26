package com.aft.api.export;

import com.aft.api.report.dto.ScenarioExcelRow;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
public class ExcelExporter {

    public byte[] export(String title, List<ScenarioExcelRow> rows) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("AFT_Rapor");
            Styles st = new Styles(wb);

            int maxRuns = Math.max(1, rows.stream().mapToInt(r -> r.runResults().size()).max().orElse(1));

            int[] statusCols = new int[maxRuns];
            int col = 3;
            for (int i = 0; i < maxRuns; i++) { if (i > 0) col++; statusCols[i] = col; col++; }
            int errStepCol = col, errMsgCol = col + 1;


            sheet.setColumnWidth(0, w(6)); sheet.setColumnWidth(1, w(30)); sheet.setColumnWidth(2, w(55));
            for (int i = 0; i < maxRuns; i++) {
                if (i > 0) sheet.setColumnWidth(statusCols[i] - 1, w(3));
                sheet.setColumnWidth(statusCols[i], w(16));
            }
            sheet.setColumnWidth(errStepCol, w(22)); sheet.setColumnWidth(errMsgCol, w(40));

            Row r1 = sheet.createRow(0); r1.setHeightInPoints(24);
            band(sheet, r1, 0, 2, title, st.header);
            band(sheet, r1, 3, errStepCol - 1, "TEST DURUMLARI", st.header);
            band(sheet, r1, errStepCol, errMsgCol, "Faaliyet Açıklama", st.header);


            Row r2 = sheet.createRow(1); r2.setHeightInPoints(26);
            put(r2, 0, "No :", st.header); put(r2, 1, "Senaryo Adı", st.header); put(r2, 2, "Senaryo Açıklaması", st.header);
            for (int i = 0; i < maxRuns; i++) {
                if (i > 0) put(r2, statusCols[i] - 1, "", st.spacer);
                put(r2, statusCols[i], "DURUMU " + (i + 1) + ".TEST", st.header);
            }
            put(r2, errStepCol, "Hata Veren Adım", st.header); put(r2, errMsgCol, "Alınan Hata", st.header);


            int rowIdx = 2;
            for (ScenarioExcelRow d : rows) {
                Row row = sheet.createRow(rowIdx); row.setHeightInPoints(22);
                boolean zebra = (rowIdx % 2 == 0);
                CellStyle leftStyle = zebra ? st.zebraLeft : st.whiteLeft;
                CellStyle centerStyle = zebra ? st.zebraCenter : st.whiteCenter;

                put(row, 0, String.valueOf(d.no()), st.no);
                put(row, 1, nz(d.scenarioName()), centerStyle);
                put(row, 2, nz(d.description()), leftStyle);
                for (int i = 0; i < maxRuns; i++) {
                    if (i > 0) put(row, statusCols[i] - 1, "", st.spacer);
                    if (i < d.runResults().size()) {
                        boolean ok = d.runResults().get(i);
                        put(row, statusCols[i], ok ? "BAŞARILI" : "BAŞARISIZ", ok ? st.pass : st.fail);
                    } else {
                        put(row, statusCols[i], "", st.spacer);
                    }
                }
                put(row, errStepCol, d.failingStep() == null ? "—" : d.failingStep(), centerStyle);
                put(row, errMsgCol, d.errorMessage() == null ? "—" : d.errorMessage(), leftStyle);
                rowIdx++;
            }

            sheet.createFreezePane(0, 2);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Excel üretilemedi", e);
        }
    }

    private static int w(int chars) { return chars * 256; }
    private static String nz(String s) { return s == null ? "" : s; }

    private static void put(Row row, int c, String val, CellStyle style) {
        Cell cell = row.createCell(c); cell.setCellValue(val); cell.setCellStyle(style);
    }

    private static void band(Sheet sheet, Row row, int c1, int c2, String text, CellStyle style) {
        for (int c = c1; c <= c2; c++) row.createCell(c).setCellStyle(style);
        row.getCell(c1).setCellValue(text);
        if (c2 > c1) sheet.addMergedRegion(new CellRangeAddress(row.getRowNum(), row.getRowNum(), c1, c2));
    }

    private static final class Styles {
        final CellStyle header, no, pass, fail, spacer, zebraLeft, zebraCenter, whiteLeft, whiteCenter;
        Styles(XSSFWorkbook wb) {
            header      = make(wb, "16365C", true, "FFFFFF", HorizontalAlignment.CENTER);
            no          = make(wb, "285E9E", true, "FFFFFF", HorizontalAlignment.CENTER);
            pass        = make(wb, "00B050", true, "FFFFFF", HorizontalAlignment.CENTER);
            fail        = make(wb, "FF0000", true, "FFFFFF", HorizontalAlignment.CENTER);
            spacer      = make(wb, "D9D9D9", false, null, HorizontalAlignment.CENTER);
            zebraCenter = make(wb, "F2F2F2", false, null, HorizontalAlignment.CENTER);
            zebraLeft   = make(wb, "F2F2F2", false, null, HorizontalAlignment.LEFT);
            whiteCenter = make(wb, "FFFFFF", false, null, HorizontalAlignment.CENTER);
            whiteLeft   = make(wb, "FFFFFF", false, null, HorizontalAlignment.LEFT);
        }

        private static XSSFCellStyle make(XSSFWorkbook wb, String bgHex, boolean bold, String fontHex, HorizontalAlignment align) {
            XSSFCellStyle s = wb.createCellStyle();
            s.setFillForegroundColor(new XSSFColor(rgb(bgHex), null));
            s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            s.setAlignment(align);
            s.setVerticalAlignment(VerticalAlignment.CENTER);
            s.setWrapText(true);
            BorderStyle thin = BorderStyle.THIN;
            s.setBorderTop(thin); s.setBorderBottom(thin); s.setBorderLeft(thin); s.setBorderRight(thin);
            XSSFFont f = wb.createFont(); f.setBold(bold);
            if (fontHex != null) f.setColor(new XSSFColor(rgb(fontHex), null));
            s.setFont(f);
            return s;
        }


        private static byte[] rgb(String h) {
            return new byte[]{
                    (byte) Integer.parseInt(h.substring(0, 2), 16),
                    (byte) Integer.parseInt(h.substring(2, 4), 16),
                    (byte) Integer.parseInt(h.substring(4, 6), 16),
            };
        }
    }
}
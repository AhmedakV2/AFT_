package com.aft.api.export;

import com.aft.api.config.StorageConfig.StorageProperties;
import com.aft.common.domain.StepResult;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;


@Component
@RequiredArgsConstructor
public class PdfExporter {

    private final MinioClient minio;
    private final StorageProperties storage;

    public byte[] export(String scenarioName, List<StepResult> results){
        try(Document doc= new Document(); ByteArrayOutputStream out = new ByteArrayOutputStream()){
            PdfWriter.getInstance(doc, out);
            doc.open();

            doc.add(new Paragraph("AFT Çalıştırma Raporu"));
            doc.add(new Paragraph("Senaryo:" +scenarioName));
            doc.add(new Paragraph(" "));

            for(StepResult sr:results){
                String line = (sr.isPassed() ? "[GECTI]" : "[KALDI]") + "Adım sonucu:" + sr.getId();
                doc.add(new Paragraph(line));

                if(sr.getErrorMessage() != null) {
                    doc.add(new Paragraph("Hata:" +sr.getErrorMessage()));
                }
                if (sr.getScreenshotKey() != null) {
                    try(var stream=minio.getObject(GetObjectArgs.builder()
                            .bucket(storage.screenshotBucket())
                            .object(sr.getScreenshotKey()).build()
                    )){
                        Image img = Image.getInstance(stream.readAllBytes());
                        img.scaleToFit(450,300);
                        doc.add(img);
                    }catch (Exception ignore){}
                    doc.add(new Paragraph(" "));
                }
            }
            doc.close();
            return out.toByteArray();

        }catch (Exception e){
            throw new IllegalStateException("PDF üretilemedi",e);
        }
    }
}

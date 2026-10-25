package com.bibo.elearning.admin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class AdminReportServiceTest {

    @Test
    void cell_quotesCommasQuotesAndNewlines() {
        assertThat(AdminReportService.cell("Santos, Maria")).isEqualTo("\"Santos, Maria\"");
        assertThat(AdminReportService.cell("He said \"hi\"")).isEqualTo("\"He said \"\"hi\"\"\"");
        assertThat(AdminReportService.cell("line1\nline2")).isEqualTo("\"line1\nline2\"");
        assertThat(AdminReportService.cell("plain")).isEqualTo("plain");
        assertThat(AdminReportService.cell(null)).isEqualTo("");
    }

    @Test
    void cell_neutralisesFormulaInjection_butNotNumbers() {
        assertThat(AdminReportService.cell("=HYPERLINK(\"x\")")).startsWith("\"'=");
        assertThat(AdminReportService.cell("@cmd")).isEqualTo("'@cmd");
        assertThat(AdminReportService.cell(-5)).isEqualTo("-5");
    }

    @Test
    void buildCsv_rejectsUnknownType() {
        AdminReportService service = new AdminReportService(null, null, null, null);
        assertThatThrownBy(() -> service.buildCsv("payroll"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unknown report type");
    }
}

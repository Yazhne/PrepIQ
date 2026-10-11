
import { useState } from "react";
import { jsPDF } from "jspdf";
import "./PDFReportButton.css";

const API_URL = "/api/assessments";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-IN");
}

function addLine(doc, text, y) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const lines = doc.splitTextToSize(String(text), 175);

  if (y + lines.length * 7 > pageHeight - 18) {
    doc.addPage();
    y = 20;
  }

  doc.text(lines, 18, y);
  return y + lines.length * 7;
}

export default function PDFReportButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function downloadReport() {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("prepiqToken");

      if (!token) {
        throw new Error("Please log in before downloading your report.");
      }

      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Could not load assessments. Please try again.");
      }

      const data = await response.json();
      const assessments = data.assessments || [];

      if (assessments.length === 0) {
        throw new Error("Complete an assessment before downloading.");
      }

      const report = {
        ...assessments[0],
        ...(assessments[0].skills || {})
      };

      const user = JSON.parse(
        localStorage.getItem("prepiqUser") || "{}"
      );

      const doc = new jsPDF();

      // Header
      doc.setFillColor(20, 23, 35);
      doc.rect(0, 0, 210, 38, "F");
      doc.setTextColor(230, 185, 90);
      doc.setFontSize(23);
      doc.text("PrepIQ", 18, 17);
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("PLACEMENT READINESS REPORT", 18, 28);

      let y = 50;
      doc.setTextColor(35, 35, 45);
      doc.setFontSize(15);
      y = addLine(doc, "STUDENT PROFILE", y);
      doc.setFontSize(11);

      y = addLine(
        doc,
        `Name: ${report.name || user.name || "Student"}`,
        y + 2
      );
      y = addLine(doc, `Target Company: ${report.company || "Not specified"}`, y);
      y = addLine(doc, `CGPA: ${report.cgpa ?? "Not provided"}`, y);
      y = addLine(doc, `Assessment Date: ${formatDate(report.createdAt)}`, y);

      y += 7;
      doc.setFontSize(15);
      y = addLine(doc, "READINESS OVERVIEW", y);
      doc.setFontSize(11);
      y = addLine(doc, `Overall Readiness: ${report.score ?? 0}/100`, y + 2);

      y += 7;
      doc.setFontSize(15);
      y = addLine(doc, "SKILL ASSESSMENT", y);
      doc.setFontSize(11);

      const skillNames = [
        { key: "java", name: "JAVA" },
        { key: "python", name: "PYTHON" },
        { key: "dsa", name: "DSA" },
        { key: "dbms", name: "DBMS" },
        { key: "os", name: "OS" },
        { key: "cn", name: "CN" },
        { key: "aptitude", name: "APTITUDE" }
      ];

      skillNames.forEach(skill => {
        const value = report[skill.key];
        if (value !== undefined && value !== null) {
          y = addLine(doc, `${skill.name}: ${value}/100`, y);
        }
      });

      y += 7;
      doc.setFontSize(15);
      y = addLine(doc, "PREPARATION RECOMMENDATIONS", y);
      doc.setFontSize(11);

      const numericSkills = skillNames
        .filter(skill => typeof report[skill.key] === "number")
        .sort((a, b) => report[a.key] - report[b.key]);

      if (numericSkills.length > 0) {
        numericSkills.slice(0, 3).forEach(skill => {
          y = addLine(
            doc,
            `Focus on ${skill.name}: current score ${report[skill.key]}/100. Practise regularly and solve interview questions.`,
            y
          );
        });
      } else {
        y = addLine(
          doc,
          "Review your lowest-scoring skills and practise consistently.",
          y
        );
      }

      y += 10;
      doc.setFontSize(9);
      addLine(
        doc,
        "PrepIQ identifies preparation gaps. This report is guidance, not a hiring guarantee.",
        y
      );

      doc.save("PrepIQ-Readiness-Report.pdf");
      setMessage("Your PDF report has been downloaded.");
    } catch (error) {
      setMessage(error.message || "Unable to generate the report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pdf-report-action">
      <button
        className="pdf-report-button"
        onClick={downloadReport}
        disabled={loading}
      >
        {loading ? "Preparing Report..." : "↓ Download PDF Report"}
      </button>

      {message && (
        <p className="pdf-report-message">{message}</p>
      )}
    </div>
  );
}

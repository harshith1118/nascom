"use client";

import { TestCase } from "@/lib/types";

/**
 * Download a single test case in various formats
 * @param testCase - The test case to download
 * @param format - The format to download in (pdf, excel, word, json)
 */
export async function downloadTestCase(testCase: TestCase, format: 'pdf' | 'excel' | 'word' | 'json' | 'text' | 'markdown') {
  const fileName = `${testCase.caseId}_${testCase.title.replace(/\s+/g, '_')}`;
  
  try {
    switch (format) {
      case 'json':
        downloadJSON(testCase, fileName);
        break;
      case 'text':
      case 'markdown':
        downloadText(testCase, fileName);
        break;
      case 'pdf':
        // For PDF, we'll use a client-side library like jsPDF
        // Import dynamically to avoid server-side issues
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(testCase.title, 10, 10);
        
        doc.setFontSize(12);
        doc.text(`Case ID: ${testCase.caseId}`, 10, 20);
        doc.text(`Priority: ${testCase.priority}`, 10, 25);
        
        doc.text("Description:", 10, 35);
        doc.text(testCase.description, 10, 40, { maxWidth: 180 });
        
        doc.text("Test Steps:", 10, 60);
        let yPosition = 65;
        testCase.testSteps.forEach((step, index) => {
          doc.text(`${index + 1}. ${step}`, 10, yPosition);
          yPosition += 7;
          // Add page break if needed
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
        });
        
        doc.text("Expected Results:", 10, yPosition + 5);
        doc.text(testCase.expectedResults, 10, yPosition + 10, { maxWidth: 180 });
        
        doc.save(`${fileName}.pdf`);
        break;
      case 'excel':
        // For Excel, we'll use SheetJS (xlsx)
        const XLSX = await import("xlsx");
        const worksheetData = [
          ['Field', 'Value'],
          ['Case ID', testCase.caseId],
          ['Title', testCase.title],
          ['Description', testCase.description],
          ['Priority', testCase.priority],
          ['Expected Results', testCase.expectedResults],
          ...testCase.testSteps.map((step, i) => [`Step ${i+1}`, step])
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TestCase");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        break;
      case 'word':
        // For Word, we'll create a simple HTML document and trigger download
        const htmlContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>${testCase.title}</title>
            </head>
            <body>
              <h1>${testCase.title}</h1>
              <p><strong>Case ID:</strong> ${testCase.caseId}</p>
              <p><strong>Priority:</strong> ${testCase.priority}</p>
              <h2>Description</h2>
              <p>${testCase.description}</p>
              <h2>Test Steps</h2>
              <ol>
                ${testCase.testSteps.map(step => `<li>${step}</li>`).join('')}
              </ol>
              <h2>Expected Results</h2>
              <p>${testCase.expectedResults}</p>
            </body>
          </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        triggerDownload(blob, `${fileName}.doc`);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error(`Error downloading test case in ${format} format:`, error);
    throw new Error(`Failed to download test case as ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download multiple test cases in various formats
 * @param testCases - The array of test cases to download
 * @param format - The format to download in (pdf, excel, word, json)
 */
export async function downloadTestCases(testCases: TestCase[], format: 'pdf' | 'excel' | 'word' | 'json' | 'text' | 'markdown') {
  const fileName = `test_cases_${new Date().toISOString().slice(0, 10)}`;
  
  try {
    switch (format) {
      case 'json':
        downloadTestCasesJSON(testCases, fileName);
        break;
      case 'text':
      case 'markdown':
        downloadTestCasesText(testCases, fileName);
        break;
      case 'pdf':
        // For multiple test cases as PDF, we'll create one document with all test cases
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        let currentPage = 1;
        
        testCases.forEach((testCase, index) => {
          if (index !== 0) {
            doc.addPage();
            currentPage++;
          }
          
          doc.setFontSize(16);
          doc.text(testCase.title, 10, 10);
          
          doc.setFontSize(12);
          doc.text(`Case ID: ${testCase.caseId}`, 10, 20);
          doc.text(`Priority: ${testCase.priority}`, 10, 25);
          
          doc.text("Description:", 10, 35);
          doc.text(testCase.description, 10, 40, { maxWidth: 180 });
          
          doc.text("Test Steps:", 10, 60);
          let yPosition = 65;
          testCase.testSteps.forEach((step, stepIndex) => {
            if (yPosition > 270) {
              doc.addPage();
              currentPage++;
              yPosition = 20;
            }
            doc.text(`${stepIndex + 1}. ${step}`, 10, yPosition);
            yPosition += 7;
          });
          
          if (yPosition > 270) {
            doc.addPage();
            currentPage++;
            yPosition = 20;
          }
          
          doc.text("Expected Results:", 10, yPosition + 5);
          doc.text(testCase.expectedResults, 10, yPosition + 10, { maxWidth: 180 });
          
          // Add page break before next test case if there is one
          if (index < testCases.length - 1) {
            doc.addPage();
            currentPage++;
          }
        });
        
        doc.save(`${fileName}.pdf`);
        break;
      case 'excel':
        const XLSX = await import("xlsx");
        const workbook = XLSX.utils.book_new();
        
        testCases.forEach((testCase, index) => {
          const worksheetData = [
            ['Field', 'Value'],
            ['Case ID', testCase.caseId],
            ['Title', testCase.title],
            ['Description', testCase.description],
            ['Priority', testCase.priority],
            ['Expected Results', testCase.expectedResults],
            ...testCase.testSteps.map((step, i) => [`Step ${i+1}`, step])
          ];
          
          const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
          XLSX.utils.book_append_sheet(workbook, worksheet, `TestCase${index + 1}`);
        });
        
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        break;
      case 'word':
        // For multiple test cases as Word document
        const allTestCasesHtml = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>Test Cases</title>
            </head>
            <body>
              <h1>Test Cases Export</h1>
              ${testCases.map(testCase => `
                <h2>${testCase.title}</h2>
                <p><strong>Case ID:</strong> ${testCase.caseId}</p>
                <p><strong>Priority:</strong> ${testCase.priority}</p>
                <h3>Description</h3>
                <p>${testCase.description}</p>
                <h3>Test Steps</h3>
                <ol>
                  ${testCase.testSteps.map(step => `<li>${step}</li>`).join('')}
                </ol>
                <h3>Expected Results</h3>
                <p>${testCase.expectedResults}</p>
                <hr>
              `).join('')}
            </body>
          </html>
        `;
        
        const blob = new Blob([allTestCasesHtml], { type: 'application/msword' });
        triggerDownload(blob, `${fileName}.doc`);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error(`Error downloading test cases in ${format} format:`, error);
    throw new Error(`Failed to download test cases as ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions
function downloadJSON(testCase: TestCase, fileName: string) {
  const jsonString = JSON.stringify(testCase, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  triggerDownload(blob, `${fileName}.json`);
}

function downloadTestCasesJSON(testCases: TestCase[], fileName: string) {
  const jsonString = JSON.stringify(testCases, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  triggerDownload(blob, `${fileName}.json`);
}

function downloadText(testCase: TestCase, fileName: string) {
  const textContent = `### Case ID: ${testCase.caseId}
**Title:** ${testCase.title}
**Description:** ${testCase.description}
**Test Steps:**
${testCase.testSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
**Expected Results:** ${testCase.expectedResults}
**Priority:** ${testCase.priority}`;
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  triggerDownload(blob, `${fileName}.txt`);
}

function downloadTestCasesText(testCases: TestCase[], fileName: string) {
  const textContent = testCases.map(testCase => `### Case ID: ${testCase.caseId}
**Title:** ${testCase.title}
**Description:** ${testCase.description}
**Test Steps:**
${testCase.testSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
**Expected Results:** ${testCase.expectedResults}
**Priority:** ${testCase.priority}`).join('\n\n---\n\n');
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  triggerDownload(blob, `${fileName}.txt`);
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

/**
 * Capture a DOM element as base64 image
 */
async function captureElement(elementId) {
  const el = document.getElementById(elementId)
  if (!el) return null
  try {
    const canvas = await html2canvas(el, {
      scale: 1.5, // Reduced scale slightly to optimize file size
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    return canvas.toDataURL('image/jpeg', 0.8) // Use JPEG with compression
  } catch (error) {
    console.error("Failed to capture element:", elementId, error)
    return null
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Generate the jsPDF document object
 */
async function createPDFDoc({ forecastData, fileName, forecastDays }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // --- Theme Colors ---
  const primaryColor = [30, 58, 138] // Dark Blue
  const secondaryColor = [59, 130, 246] // Blue
  const textColor = [30, 41, 59] // Slate 800
  const lightGray = [241, 245, 249]

  // --- Page 1: Executive Summary & KPIs ---

  // Header Bar
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('FORECASTIFY', margin, 22)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Advanced Predictive Analysis Report', margin, 30)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 22, { align: 'right' })
  if (fileName) doc.text(`Source: ${fileName}`, pageWidth - margin, 30, { align: 'right' })

  y = 55

  // Executive Summary Title
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Executive Summary', margin, y)
  y += 8

  // Compute Metrics
  const actuals = forecastData.actualValues
  // Use sliced forecast arrays based on forecastDays if provided, otherwise fallback to all
  const fDays = forecastDays || forecastData.forecastValues.length
  const forecasts = forecastData.forecastValues.slice(0, fDays)
  const actualDates = forecastData.actualDates
  const forecastDates = forecastData.forecastDates.slice(0, fDays)

  const totalActual = actuals.reduce((a, b) => a + b, 0)
  const totalForecast = forecasts.reduce((a, b) => a + b, 0)
  const lastActual = actuals[actuals.length - 1]
  const lastForecast = forecasts[forecasts.length - 1]
  const peakActual = Math.max(...actuals)
  const peakForecast = Math.max(...forecasts)
  const growth = lastActual > 0 ? ((lastForecast - lastActual) / lastActual) * 100 : 0
  const trendText = growth > 2 ? 'an upward trend' : growth < -2 ? 'a downward trend' : 'a stable trajectory'

  // Generate Factual Prose
  doc.setTextColor(...textColor)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const summaryText = `This document presents a comprehensive predictive analysis based on historical data spanning from ${formatDate(actualDates[0])} to ${formatDate(actualDates[actualDates.length - 1])}, consisting of ${actuals.length} recorded observations. Utilizing a robust ${forecastData.best_model} algorithm tailored for detrended seasonality, the system has generated a precise forecast for the subsequent ${forecasts.length} periods (ending on ${formatDate(forecastDates[forecastDates.length - 1])}).

The historical analysis reveals a total accumulated value of ${totalActual.toLocaleString(undefined, {maximumFractionDigits:2})} with a peak observation of ${peakActual.toLocaleString(undefined, {maximumFractionDigits:2})}. The predictive model projects a total accumulated value of ${totalForecast.toLocaleString(undefined, {maximumFractionDigits:2})} over the specified forecast horizon. Comparing the final historical data point to the end of the forecast period, the model anticipates ${trendText}, representing an estimated growth/decline of ${growth.toFixed(2)}%.`

  const splitText = doc.splitTextToSize(summaryText, contentWidth)
  doc.text(splitText, margin, y)
  y += (splitText.length * 5) + 12

  // Key Performance Indicators Title
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Key Performance Indicators', margin, y)
  y += 6

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Description']],
    body: [
      ['Total Historical', totalActual.toLocaleString(undefined, {maximumFractionDigits:2}), 'Sum of all actual historical observations'],
      ['Total Projected', totalForecast.toLocaleString(undefined, {maximumFractionDigits:2}), `Sum of projected values over next ${forecasts.length} periods`],
      ['Historical Peak', peakActual.toLocaleString(undefined, {maximumFractionDigits:2}), 'Highest recorded actual value'],
      ['Projected Peak', peakForecast.toLocaleString(undefined, {maximumFractionDigits:2}), 'Highest projected value in forecast'],
      ['Overall Trajectory', `${growth > 0 ? '+' : ''}${growth.toFixed(2)}%`, 'Percentage change from current to end of forecast'],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10, textColor: textColor },
    alternateRowStyles: { fillColor: lightGray },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  })

  y = doc.lastAutoTable.finalY + 15

  // Data Timeline
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Data Timeline & Scope', margin, y)
  y += 6

  autoTable(doc, {
    startY: y,
    head: [['Phase', 'Start Date', 'End Date', 'Observations']],
    body: [
      ['Historical Tracking', formatDate(actualDates[0]), formatDate(actualDates[actualDates.length - 1]), actuals.length.toString()],
      ['Predictive Horizon', formatDate(forecastDates[0]), formatDate(forecastDates[forecastDates.length - 1]), forecasts.length.toString()],
    ],
    headStyles: { fillColor: secondaryColor, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10, textColor: textColor },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  })

  // --- Page 2+: Charts ---
  
  const chartIds = [
    { id: 'chart-forecast', title: 'Predictive Model: Actual vs Forecast', desc: 'This visualization displays the historical data contiguous with the predicted values generated by the XGBoost algorithm.' },
    { id: 'chart-scatter', title: 'Profit vs Revenue Analysis', desc: 'Scatter plot demonstrating the relationship between generated revenue and profit margins across different categories.' },
    { id: 'chart-bar-cat', title: 'Sales Distribution by Category', desc: 'A comparative view of total sales volume broken down by product category.' },
    { id: 'chart-horiz-bar', title: 'Top Performing Products', desc: 'Ranking of the top 10 individual products driving the highest revenue.' },
    { id: 'chart-pie', title: 'Regional Revenue Share', desc: 'Proportional breakdown of historical performance distributed across geographic regions.' },
    { id: 'chart-multi-line', title: 'Category Trends Over Time', desc: 'Time series analysis comparing the monthly revenue trajectories of different categories.' },
    { id: 'chart-bar-dow', title: 'Revenue by Day of Week', desc: 'Analysis of purchasing patterns based on the day of the week, identifying peak transaction days.' },
    { id: 'chart-heat-reg', title: 'Category & Region Heatmap', desc: 'Density matrix highlighting high-performing intersections between specific categories and geographic regions.' },
    { id: 'chart-corr', title: 'Correlation & Density Matrix', desc: 'Detailed view of the concentration of actual values over time.' },
  ]

  let chartsAdded = 0
  for (const { id, title, desc } of chartIds) {
    const imgData = await captureElement(id)
    if (!imgData) continue

    // Smart pagination: Check if we have enough space (need ~130mm for a chart + text)
    if (chartsAdded === 0 || y + 130 > pageHeight - margin) {
      doc.addPage()
      y = margin
    } else {
      y += 20 // Space between charts on the same page
    }

    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(title, margin, y)
    y += 6

    doc.setTextColor(...textColor)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    const descLines = doc.splitTextToSize(desc, contentWidth)
    doc.text(descLines, margin, y)
    y += (descLines.length * 5) + 4

    // Image rendering
    const imgWidth = contentWidth
    const imgHeight = 90 // Set consistent height
    
    // Border wrapper for the chart
    doc.setDrawColor(203, 213, 225) // Slate 300
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, y, imgWidth, imgHeight, 3, 3, 'S')
    
    try {
      doc.addImage(imgData, 'JPEG', margin + 2, y + 2, imgWidth - 4, imgHeight - 4)
      y += imgHeight
      chartsAdded++
    } catch(e) {
      console.error("Error adding image to PDF", e)
    }
  }

  // --- Global Footer ---
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    
    // Bottom border line
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
    
    doc.text(
      `Forecastify Advanced Analytics • Confidential • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  return doc
}

/**
 * Generate and download an Industry-Standard PDF report
 */
export async function generatePDFReport(args) {
  const doc = await createPDFDoc(args)
  doc.save(`Forecastify_Analysis_${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Generate and return PDF as a Blob
 */
export async function getPDFBlob(args) {
  const doc = await createPDFDoc(args)
  return doc.output('blob')
}

/**
 * Data export utilities for PDF and CSV generation
 * 
 * This module provides utilities for exporting session data, user reports,
 * and nutrition plans in various formats (PDF, CSV) using jsPDF and html2canvas.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type {
  SessionAnalysis,
  SessionSummary,
  NutritionPlan,
  User,
  GaitSample,
  ExportFormat,
  ExportRequest,
} from './contracts';

// ============================================================================
// PDF EXPORT UTILITIES
// ============================================================================

/**
 * PDF export configuration
 */
interface PDFConfig {
  format: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeCharts: boolean;
  includeRawData: boolean;
}

const DEFAULT_PDF_CONFIG: PDFConfig = {
  format: 'a4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  includeCharts: true,
  includeRawData: false,
};

/**
 * Generate PDF report from HTML element
 */
export const generatePDFFromElement = async (
  element: HTMLElement,
  filename: string,
  config: Partial<PDFConfig> = {}
): Promise<Blob> => {
  const finalConfig = { ...DEFAULT_PDF_CONFIG, ...config };
  
  try {
    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: finalConfig.orientation,
      unit: 'mm',
      format: finalConfig.format,
    });
    
    // Calculate dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - finalConfig.margins.left - finalConfig.margins.right;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    
    if (imgHeight <= pageHeight - finalConfig.margins.top - finalConfig.margins.bottom) {
      // Single page
      pdf.addImage(
        imgData,
        'PNG',
        finalConfig.margins.left,
        finalConfig.margins.top,
        imgWidth,
        imgHeight
      );
    } else {
      // Multiple pages
      let remainingHeight = imgHeight;
      let position = 0;
      
      while (remainingHeight > 0) {
        const pageImgHeight = Math.min(
          remainingHeight,
          pageHeight - finalConfig.margins.top - finalConfig.margins.bottom
        );
        
        pdf.addImage(
          imgData,
          'PNG',
          finalConfig.margins.left,
          finalConfig.margins.top - position,
          imgWidth,
          pageImgHeight
        );
        
        remainingHeight -= pageImgHeight;
        position += pageImgHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }
    
    return pdf.output('blob');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  }
};

/**
 * Generate session analysis PDF report
 */
export const generateSessionPDF = async (
  analysis: SessionAnalysis,
  user: User,
  config: Partial<PDFConfig> = {}
): Promise<Blob> => {
  const finalConfig = { ...DEFAULT_PDF_CONFIG, ...config };
  
  const pdf = new jsPDF({
    orientation: finalConfig.orientation,
    unit: 'mm',
    format: finalConfig.format,
  });
  
  const { margins } = finalConfig;
  let yPosition = margins.top;
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Neurostep Gait Analysis Report', margins.left, yPosition);
  yPosition += 15;
  
  // User info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Patient: ${user.profile.firstName} ${user.profile.lastName}`, margins.left, yPosition);
  yPosition += 8;
  pdf.text(`Date: ${new Date(analysis.createdAt).toLocaleDateString()}`, margins.left, yPosition);
  yPosition += 8;
  pdf.text(`Session ID: ${analysis.sessionId}`, margins.left, yPosition);
  yPosition += 15;
  
  // KPIs Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Performance Indicators', margins.left, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const kpiData = [
    ['Average Step Length', `${analysis.kpis.averageStepLength.toFixed(1)} cm`],
    ['Average Cadence', `${analysis.kpis.averageCadence.toFixed(0)} steps/min`],
    ['Symmetry Index', `${(analysis.kpis.symmetryIndex * 100).toFixed(1)}%`],
    ['Stability Score', `${analysis.kpis.stabilityScore.toFixed(1)}/10`],
    ['Fall Risk', analysis.kpis.fallRisk.toUpperCase()],
  ];
  
  kpiData.forEach(([label, value]) => {
    pdf.text(`${label}: ${value}`, margins.left, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Metrics Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Metrics', margins.left, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const metricsData = [
    ['Total Steps', analysis.metrics.totalSteps.toString()],
    ['Total Distance', `${analysis.metrics.totalDistance.toFixed(1)} m`],
    ['Average Speed', `${analysis.metrics.averageSpeed.toFixed(2)} m/s`],
    ['Left-Right Balance', `${analysis.metrics.leftRightBalance.toFixed(1)}%`],
    ['Gait Cycle Time', `${analysis.metrics.gaitCycleTime.toFixed(2)} s`],
  ];
  
  metricsData.forEach(([label, value]) => {
    pdf.text(`${label}: ${value}`, margins.left, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Recommendations Section
  if (analysis.recommendations.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margins.left, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    analysis.recommendations.forEach((rec, index) => {
      pdf.text(`${index + 1}. ${rec.description}`, margins.left, yPosition);
      yPosition += 6;
      if (rec.frequency) {
        pdf.text(`   Frequency: ${rec.frequency}`, margins.left, yPosition);
        yPosition += 6;
      }
      yPosition += 3;
    });
  }
  
  return pdf.output('blob');
};

/**
 * Generate nutrition plan PDF
 */
export const generateNutritionPlanPDF = async (
  plan: NutritionPlan,
  config: Partial<PDFConfig> = {}
): Promise<Blob> => {
  const finalConfig = { ...DEFAULT_PDF_CONFIG, ...config };
  
  const pdf = new jsPDF({
    orientation: finalConfig.orientation,
    unit: 'mm',
    format: finalConfig.format,
  });
  
  const { margins } = finalConfig;
  let yPosition = margins.top;
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Nutrition Plan', margins.left, yPosition);
  yPosition += 15;
  
  // Plan info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Plan: ${plan.title}`, margins.left, yPosition);
  yPosition += 8;
  pdf.text(`Duration: ${plan.duration} days`, margins.left, yPosition);
  yPosition += 8;
  pdf.text(`Created: ${new Date(plan.createdAt).toLocaleDateString()}`, margins.left, yPosition);
  yPosition += 15;
  
  // Description
  if (plan.description) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description', margins.left, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const descriptionLines = pdf.splitTextToSize(plan.description, 170);
    pdf.text(descriptionLines, margins.left, yPosition);
    yPosition += descriptionLines.length * 5 + 10;
  }
  
  // Goals
  if (plan.goals.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Goals', margins.left, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    plan.goals.forEach((goal, index) => {
      pdf.text(`${index + 1}. ${goal}`, margins.left, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }
  
  // Meals
  if (plan.meals.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Meal Plan', margins.left, yPosition);
    yPosition += 10;
    
    plan.meals.forEach((meal) => {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}: ${meal.name}`, margins.left, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Calories: ${meal.totalCalories} | Protein: ${meal.macros.protein}g | Carbs: ${meal.macros.carbs}g | Fat: ${meal.macros.fat}g`, margins.left, yPosition);
      yPosition += 6;
      
      if (meal.instructions) {
        const instructionLines = pdf.splitTextToSize(meal.instructions, 170);
        pdf.text(instructionLines, margins.left, yPosition);
        yPosition += instructionLines.length * 4 + 8;
      } else {
        yPosition += 8;
      }
    });
  }
  
  return pdf.output('blob');
};

// ============================================================================
// CSV EXPORT UTILITIES
// ============================================================================

/**
 * Convert array of objects to CSV string
 */
const arrayToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Generate CSV blob from data
 */
const generateCSVBlob = (csvString: string): Blob => {
  return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Export gait samples to CSV
 */
export const exportGaitSamplesToCSV = (samples: GaitSample[]): Blob => {
  const csvData = samples.map(sample => ({
    timestamp: new Date(sample.timestamp).toISOString(),
    leftPressure: sample.leftPressure,
    rightPressure: sample.rightPressure,
    copX: sample.copX,
    copY: sample.copY,
    strideLength: sample.strideLength,
    strideFreq: sample.strideFreq,
    cadence: sample.cadence,
    stepWidth: sample.stepWidth,
    sessionId: sample.sessionId,
    userId: sample.userId,
  }));
  
  const csvString = arrayToCSV(csvData);
  return generateCSVBlob(csvString);
};

/**
 * Export session summaries to CSV
 */
export const exportSessionsToCSV = (sessions: SessionSummary[]): Blob => {
  const csvData = sessions.map(session => ({
    sessionId: session.sessionId,
    userId: session.userId,
    type: session.type,
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime || '',
    duration: session.duration,
    averageStepLength: session.kpis.averageStepLength || '',
    averageCadence: session.kpis.averageCadence || '',
    symmetryIndex: session.kpis.symmetryIndex || '',
    stabilityScore: session.kpis.stabilityScore || '',
    fallRisk: session.kpis.fallRisk || '',
    hasAnalysis: session.hasAnalysis,
  }));
  
  const csvString = arrayToCSV(csvData);
  return generateCSVBlob(csvString);
};

/**
 * Export nutrition plan to CSV
 */
export const exportNutritionPlanToCSV = (plan: NutritionPlan): Blob => {
  const mealData = plan.meals.map(meal => ({
    planId: plan.id,
    planTitle: plan.title,
    mealType: meal.type,
    mealName: meal.name,
    totalCalories: meal.totalCalories,
    protein: meal.macros.protein,
    carbs: meal.macros.carbs,
    fat: meal.macros.fat,
    fiber: meal.macros.fiber,
    prepTime: meal.prepTime || '',
    instructions: meal.instructions || '',
  }));
  
  const csvString = arrayToCSV(mealData);
  return generateCSVBlob(csvString);
};

// ============================================================================
// EXPORT ORCHESTRATOR
// ============================================================================

/**
 * Main export function that handles different export types and formats
 */
export const exportData = async (
  request: ExportRequest,
  data: any,
  user?: User
): Promise<Blob> => {
  const { type, format, includeCharts = true, includeRawData = false } = request;
  
  try {
    switch (format) {
      case 'pdf':
        switch (type) {
          case 'session':
            return await generateSessionPDF(data, user!, { includeCharts, includeRawData });
          case 'nutrition_plan':
            return await generateNutritionPlanPDF(data, { includeCharts, includeRawData });
          default:
            throw new Error(`PDF export not supported for type: ${type}`);
        }
      
      case 'csv':
        switch (type) {
          case 'session':
            if (Array.isArray(data)) {
              return exportSessionsToCSV(data);
            } else if (data.samples) {
              return exportGaitSamplesToCSV(data.samples);
            }
            throw new Error('Invalid session data for CSV export');
          case 'nutrition_plan':
            return exportNutritionPlanToCSV(data);
          default:
            throw new Error(`CSV export not supported for type: ${type}`);
        }
      
      default:
        throw new Error(`Export format not supported: ${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export ${type} as ${format}`);
  }
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate filename for export
 */
export const generateExportFilename = (
  type: string,
  format: ExportFormat,
  entityId?: string,
  timestamp?: Date
): string => {
  const date = (timestamp || new Date()).toISOString().split('T')[0];
  const id = entityId ? `-${entityId.slice(-8)}` : '';
  return `neurostep-${type}${id}-${date}.${format}`;
};
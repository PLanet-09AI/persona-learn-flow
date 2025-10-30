import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, FileText, Mail, Copy, Check, Image as ImageIcon, CreditCard, Sparkles, FileDown } from 'lucide-react';
import { cvGeneratorService } from '@/services/cvGenerator';
import { cvGenerationTracker } from '@/services/cvGenerationTracker';
import { paymentFirebaseService } from '@/services/paymentFirebase';
import { UserProfile } from '@/types/payment';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import CVPreviewFormatter from './CVPreviewFormatter';

interface CVGeneratorProps {
  profile: UserProfile;
}

const CVGenerator: React.FC<CVGeneratorProps> = ({ profile }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string>('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');
  const [copiedCV, setCopiedCV] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  
  // Generation tracking
  const [generationStats, setGenerationStats] = useState({
    freeUsed: 0,
    freeRemaining: 3,
    paidUsed: 0,
    paidRemaining: 0,
    totalRemaining: 3,
    hasPaid: false
  });
  
  // CV Options
  const [template, setTemplate] = useState<'modern' | 'classic' | 'creative' | 'minimal'>('modern');
  const [includePhoto, setIncludePhoto] = useState(false);
  const [format, setFormat] = useState<'markdown' | 'html' | 'latex'>('markdown');
  
  // Cover Letter Options
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const templates = cvGeneratorService.getAvailableTemplates();

  // Load generation statistics on mount
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      
      try {
        const stats = await cvGenerationTracker.getStatistics(user.id);
        setGenerationStats(stats);
        console.log('📊 Generation stats loaded:', stats);
      } catch (error) {
        console.error('Error loading generation stats:', error);
      }
    };

    loadStats();
  }, [user]);

  const handleGenerateCV = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Check if user can generate
      const eligibility = await cvGenerationTracker.canGenerateCV(user.id);
      
      if (!eligibility.canGenerate) {
        toast({
          title: "Generation Limit Reached",
          description: eligibility.reason,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('✅ User can generate CV. Remaining:', eligibility.totalRemaining);

      const cvContent = await cvGeneratorService.generateCV(profile, {
        template,
        includePhoto,
        format
      });
      
      // Record the generation
      await cvGenerationTracker.recordGeneration(user.id);
      
      // Update stats
      const updatedStats = await cvGenerationTracker.getStatistics(user.id);
      setGenerationStats(updatedStats);
      
      setGeneratedCV(cvContent);
      
      toast({
        title: "CV Generated Successfully!",
        description: `Your professional CV has been created. ${updatedStats.totalRemaining} generations remaining.`,
      });
    } catch (error) {
      console.error('Error generating CV:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!user || !jobTitle || !companyName) {
      toast({
        title: "Missing Information",
        description: "Please provide job title and company name.",
        variant: "destructive",
      });
      return;
    }

    setCoverLetterLoading(true);
    try {
      const coverLetter = await cvGeneratorService.generateCoverLetter(
        profile,
        jobTitle,
        companyName,
        jobDescription
      );
      
      setGeneratedCoverLetter(coverLetter);
      
      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter has been created.",
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCoverLetterLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'cv' | 'coverLetter') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'cv') {
        setCopiedCV(true);
        setTimeout(() => setCopiedCV(false), 2000);
      } else {
        setCopiedCoverLetter(true);
        setTimeout(() => setCopiedCoverLetter(false), 2000);
      }
      
      toast({
        title: "Copied!",
        description: `${type === 'cv' ? 'CV' : 'Cover letter'} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${filename} has been downloaded.`,
    });
  };

  const exportToPDF = async (content: string, filename: string, type: 'cv' | 'coverLetter') => {
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);
      let y = margin;

      // Color scheme
      const primaryColor: [number, number, number] = [41, 128, 185]; // Professional blue
      const accentColor: [number, number, number] = [52, 73, 94]; // Dark gray
      const lightGray: [number, number, number] = [236, 240, 241];

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (y + requiredSpace > pageHeight - margin) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Helper function to add styled section header
      const addSectionHeader = (title: string) => {
        checkPageBreak(15);
        
        // Add colored background bar
        doc.setFillColor(...primaryColor);
        doc.rect(margin - 5, y - 2, maxLineWidth + 10, 8, 'F');
        
        // Add section title
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(title.toUpperCase(), margin, y + 4);
        
        y += 12;
        doc.setTextColor(0, 0, 0);
      };

      // Helper function to add regular text with proper formatting
      const addText = (text: string, options: { bold?: boolean; fontSize?: number; indent?: number; spacing?: number } = {}) => {
        const { bold = false, fontSize = 10, indent = 0, spacing = 5 } = options;
        
        checkPageBreak(spacing + 5);
        
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);
        
        const lines = doc.splitTextToSize(text, maxLineWidth - indent);
        lines.forEach((line: string) => {
          checkPageBreak(spacing);
          doc.text(line, margin + indent, y);
          y += spacing;
        });
      };

      if (type === 'cv') {
        // ============ CV STYLING ============
        
        // Parse CV content
        const lines = content.split('\n');
        let currentSection = '';
        
        // Add header with accent bar at top
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 12, 'F');
        y = 15;

        lines.forEach((line, index) => {
          const trimmed = line.trim();
          
          // Skip empty lines at the beginning
          if (!trimmed && y < 30) return;
          
          // Detect name (usually first significant line)
          if (index < 5 && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('**') && trimmed.length > 3 && currentSection === '') {
            // Name styling
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text(trimmed, margin, y);
            y += 10;
            
            // Add decorative line under name
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.line(margin, y - 3, pageWidth - margin, y - 3);
            y += 5;
            return;
          }
          
          // Detect contact info (email, phone, etc.)
          if ((trimmed.includes('@') || trimmed.includes('tel:') || trimmed.includes('linkedin') || trimmed.includes('github')) && y < 50) {
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const contactLines = doc.splitTextToSize(trimmed.replace(/\*\*/g, '').replace(/[#*]/g, ''), maxLineWidth);
            contactLines.forEach((cLine: string) => {
              doc.text(cLine, margin, y);
              y += 4;
            });
            y += 3;
            return;
          }
          
          // Detect section headers (Markdown headers or bold text)
          if (trimmed.startsWith('##') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50)) {
            const sectionTitle = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
            if (sectionTitle && sectionTitle.length > 2) {
              currentSection = sectionTitle;
              addSectionHeader(sectionTitle);
              return;
            }
          }
          
          // Detect subsection headers (job titles, degrees, etc.)
          if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.includes('|'))) {
            const subTitle = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
            checkPageBreak(8);
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            const subLines = doc.splitTextToSize(subTitle, maxLineWidth);
            subLines.forEach((sLine: string) => {
              doc.text(sLine, margin, y);
              y += 5;
            });
            y += 2;
            return;
          }
          
          // Detect bullet points
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const bulletText = trimmed.replace(/^[•\-*]\s*/, '');
            checkPageBreak(6);
            
            // Add bullet point
            doc.setFillColor(...primaryColor);
            doc.circle(margin + 2, y - 1.5, 0.8, 'F');
            
            // Add bullet text
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const bulletLines = doc.splitTextToSize(bulletText, maxLineWidth - 8);
            bulletLines.forEach((bLine: string, bIndex: number) => {
              doc.text(bLine, margin + 6, y);
              if (bIndex < bulletLines.length - 1) y += 4;
            });
            y += 5;
            return;
          }
          
          // Regular paragraph text
          if (trimmed) {
            const cleanText = trimmed.replace(/\*\*/g, '');
            addText(cleanText, { fontSize: 10, spacing: 4 });
            return;
          }
          
          // Empty lines (spacing)
          if (!trimmed && y > 30) {
            y += 3;
          }
        });

      } else {
        // ============ COVER LETTER STYLING ============
        
        // Add elegant header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 8, 'F');
        y = 20;

        const lines = content.split('\n');
        let isHeaderSection = true;
        
        lines.forEach((line) => {
          const trimmed = line.trim();
          
          if (!trimmed) {
            y += 4;
            return;
          }
          
          // Detect sender info (first few lines before date)
          if (isHeaderSection && y < 60 && !trimmed.match(/^\d{1,2}\s+\w+\s+\d{4}/)) {
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            addText(trimmed, { fontSize: 11, spacing: 4, bold: true });
            return;
          }
          
          // Detect date
          if (trimmed.match(/^\d{1,2}\s+\w+\s+\d{4}/) || trimmed.match(/^\w+\s+\d{1,2},\s+\d{4}/)) {
            isHeaderSection = false;
            y += 5;
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            addText(trimmed, { fontSize: 10, spacing: 5 });
            y += 5;
            return;
          }
          
          // Detect recipient info (after date, before greeting)
          if (!isHeaderSection && !trimmed.startsWith('Dear') && !trimmed.startsWith('Hi') && y < 100) {
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            addText(trimmed, { fontSize: 10, spacing: 4 });
            return;
          }
          
          // Detect greeting
          if (trimmed.startsWith('Dear') || trimmed.startsWith('Hi') || trimmed.startsWith('Hello')) {
            y += 3;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            addText(trimmed, { fontSize: 11, spacing: 5, bold: true });
            y += 3;
            return;
          }
          
          // Detect closing
          if (trimmed.startsWith('Sincerely') || trimmed.startsWith('Best regards') || trimmed.startsWith('Kind regards') || trimmed.startsWith('Yours')) {
            y += 5;
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            addText(trimmed, { fontSize: 11, spacing: 5, bold: true });
            y += 15; // Space for signature
            return;
          }
          
          // Regular paragraph text
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const paraLines = doc.splitTextToSize(trimmed, maxLineWidth);
          paraLines.forEach((pLine: string) => {
            checkPageBreak(5);
            doc.text(pLine, margin, y);
            y += 5;
          });
          y += 2; // Paragraph spacing
        });
      }

      // Add footer with page numbers and subtle styling
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Add subtle footer line
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Add page number
        doc.setTextColor(...accentColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        // Add document title
        const docTitle = type === 'cv' ? 'Curriculum Vitae' : 'Cover Letter';
        doc.text(docTitle, margin, pageHeight - 10);
      }
      
      // Save the PDF
      doc.save(filename);
      
      toast({
        title: "Professional PDF Downloaded!",
        description: `${filename} has been saved with styled formatting.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Export Failed",
        description: "Failed to generate PDF. Downloading as text file instead.",
        variant: "destructive",
      });
      // Fallback to text download
      downloadAsFile(content, filename.replace('.pdf', '.txt'));
    }
  };

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Generation Limits Banner */}
      <Alert className={generationStats.totalRemaining > 0 ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
        <Sparkles className={`h-4 w-4 ${generationStats.totalRemaining > 0 ? "text-blue-600" : "text-orange-600"}`} />
        <AlertDescription className={generationStats.totalRemaining > 0 ? "text-blue-800" : "text-orange-800"}>
          {generationStats.hasPaid ? (
            <div className="flex items-center justify-between">
              <div>
                <strong>Premium Active</strong> - {generationStats.paidRemaining} paid generations remaining
                <span className="block text-sm mt-1">
                  Free: {generationStats.freeRemaining}/3 | Paid: {generationStats.paidRemaining}/20
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <strong>Free Tier</strong> - {generationStats.freeRemaining}/3 free generations remaining
                {generationStats.freeRemaining === 0 && (
                  <span className="block text-sm mt-1">
                    Subscribe to unlock 20 more CV generations!
                  </span>
                )}
              </div>
              {generationStats.freeRemaining === 0 && (
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = '/profile'}
                  className="ml-4"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Button>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="cv" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="cv" className="text-base">
            <FileText className="h-4 w-4 mr-2" />
            CV Generator
          </TabsTrigger>
          <TabsTrigger value="cover-letter" className="text-base">
            <Mail className="h-4 w-4 mr-2" />
            Cover Letter
          </TabsTrigger>
        </TabsList>

        {/* CV Tab Content */}
        <TabsContent value="cv" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-16rem)]">
            {/* Left Panel - Controls */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-xl">CV Settings</CardTitle>
                <CardDescription>
                  Customize your CV template and format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Template Style</Label>
                  <Select value={template} onValueChange={(value: any) => setTemplate(value)}>
                    <SelectTrigger className="h-auto py-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templates).map(([key, template]) => (
                        <SelectItem key={key} value={key} className="py-3">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-sm text-muted-foreground">{template.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Output Format</Label>
                  <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                    <SelectTrigger className="h-auto py-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown" className="py-3">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Markdown</span>
                          <span className="text-sm text-muted-foreground">Clean, readable format</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="html" className="py-3">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">HTML</span>
                          <span className="text-sm text-muted-foreground">Web-ready format</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="latex" className="py-3">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">LaTeX</span>
                          <span className="text-sm text-muted-foreground">Professional typesetting</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Photo Option */}
                <div className="flex items-start justify-between p-4 border-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="flex-1">
                    <Label htmlFor="include-photo" className="flex items-center gap-2 cursor-pointer text-base font-semibold">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                      Include Photo
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a professional photo section (4x5cm)
                    </p>
                  </div>
                  <Switch
                    id="include-photo"
                    checked={includePhoto}
                    onCheckedChange={setIncludePhoto}
                    className="mt-1"
                  />
                </div>

                <Separator />

                <Button onClick={handleGenerateCV} disabled={loading} className="w-full h-12 text-base">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating CV...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Generate CV
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right Panel - Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">CV Preview</CardTitle>
                    <CardDescription className="mt-1">
                      {generatedCV ? (
                        <span className="text-sm">
                          Format: <span className="font-medium capitalize">{format}</span>
                        </span>
                      ) : (
                        'Your generated CV will appear here'
                      )}
                    </CardDescription>
                  </div>
                  {generatedCV && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCV, 'cv')}
                        title="Copy to clipboard"
                      >
                        {copiedCV ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAsFile(generatedCV, `${profile.firstName}_${profile.lastName}_CV.${format === 'markdown' ? 'md' : format === 'html' ? 'html' : 'tex'}`)}
                        title="Download as text"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => exportToPDF(generatedCV, `${profile.firstName}_${profile.lastName}_CV.pdf`, 'cv')}
                        title="Export as PDF"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedCV ? (
                  <div className="border-2 rounded-lg p-8 bg-white dark:bg-gray-950 min-h-[600px]">
                    <CVPreviewFormatter content={generatedCV} format={format} />
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-12 min-h-[600px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No CV Generated Yet</p>
                      <p className="text-sm mt-2">Select your preferences and click "Generate CV"</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cover Letter Tab Content */}
        <TabsContent value="cover-letter" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-16rem)]">
            {/* Left Panel - Job Details */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-xl">Job Details</CardTitle>
                <CardDescription>
                  Enter the position you're applying for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="job-title" className="text-base font-semibold">
                    Job Title *
                  </Label>
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Developer"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-base font-semibold">
                    Company Name *
                  </Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Tech Corp"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-description" className="text-base font-semibold">
                    Job Description (Optional)
                  </Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for a more tailored cover letter..."
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adding the job description helps create a more personalized cover letter
                  </p>
                </div>

                <Separator />

                <Button 
                  onClick={handleGenerateCoverLetter} 
                  disabled={coverLetterLoading || !jobTitle || !companyName} 
                  className="w-full h-12 text-base"
                >
                  {coverLetterLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Letter...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right Panel - Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Cover Letter Preview</CardTitle>
                    <CardDescription className="mt-1">
                      {generatedCoverLetter ? 
                        `For ${jobTitle} at ${companyName}` : 
                        'Your generated cover letter will appear here'
                      }
                    </CardDescription>
                  </div>
                  {generatedCoverLetter && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCoverLetter, 'coverLetter')}
                        title="Copy to clipboard"
                      >
                        {copiedCoverLetter ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAsFile(generatedCoverLetter, `${profile.firstName}_${profile.lastName}_CoverLetter_${companyName.replace(/\s+/g, '_')}.txt`)}
                        title="Download as text"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => exportToPDF(generatedCoverLetter, `${profile.firstName}_${profile.lastName}_CoverLetter_${companyName.replace(/\s+/g, '_')}.pdf`, 'coverLetter')}
                        title="Export as PDF"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedCoverLetter ? (
                  <div className="border-2 rounded-lg p-8 bg-white dark:bg-gray-950 min-h-[600px]">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-serif max-w-3xl">
                      {generatedCoverLetter}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-12 min-h-[600px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Mail className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No Cover Letter Generated Yet</p>
                      <p className="text-sm mt-2">Fill in the job details and click "Generate Cover Letter"</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
          <CardDescription>
            Current profile information used for CV generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {profile.firstName} {profile.lastName}
              </div>
              <div>
                <span className="font-medium">Industry:</span> {profile.industry}
              </div>
              <div>
                <span className="font-medium">Experience Level:</span> {profile.experienceLevel}
              </div>
              <div>
                <span className="font-medium">Target Role:</span> {profile.targetJobTitle || 'Open to opportunities'}
              </div>
            </div>
            
            {profile.skills.length > 0 && (
              <div>
                <span className="font-medium text-sm">Skills:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.skills.slice(0, 10).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.skills.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Alert>
              <AlertDescription>
                💡 <strong>Tip:</strong> Keep your profile updated with current experience and skills for better CV generation results. 
                You can update your profile information from the Profile page.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVGenerator;

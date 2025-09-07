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
import { Loader2, Download, FileText, Mail, Copy, Check } from 'lucide-react';
import { cvGeneratorService } from '@/services/cvGenerator';
import { paymentFirebaseService } from '@/services/paymentFirebase';
import { UserProfile } from '@/types/payment';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

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
  
  // CV Options
  const [template, setTemplate] = useState<'modern' | 'classic' | 'creative' | 'minimal'>('modern');
  const [includePhoto, setIncludePhoto] = useState(false);
  const [format, setFormat] = useState<'markdown' | 'html' | 'latex'>('markdown');
  
  // Cover Letter Options
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const templates = cvGeneratorService.getAvailableTemplates();

  const handleGenerateCV = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const cvContent = await cvGeneratorService.generateCV(profile, {
        template,
        includePhoto,
        format
      });
      
      setGeneratedCV(cvContent);
      
      toast({
        title: "CV Generated Successfully!",
        description: "Your professional CV has been created based on your profile.",
      });
    } catch (error) {
      console.error('Error generating CV:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate CV. Please try again.",
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

  return (
    <div className="space-y-6">
      {/* CV Generator Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Generator
          </CardTitle>
          <CardDescription>
            Generate a professional CV using AI based on your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Template Style</Label>
            <Select value={template} onValueChange={(value: any) => setTemplate(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
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
            <Label>Output Format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">
                  <div className="flex flex-col items-start">
                    <span>Markdown</span>
                    <span className="text-sm text-muted-foreground">Clean, readable format</span>
                  </div>
                </SelectItem>
                <SelectItem value="html">
                  <div className="flex flex-col items-start">
                    <span>HTML</span>
                    <span className="text-sm text-muted-foreground">Web-ready format</span>
                  </div>
                </SelectItem>
                <SelectItem value="latex">
                  <div className="flex flex-col items-start">
                    <span>LaTeX</span>
                    <span className="text-sm text-muted-foreground">Professional typesetting</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Option */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="include-photo">Include Photo Placeholder</Label>
              <p className="text-sm text-muted-foreground">
                Add a photo placeholder in the CV header
              </p>
            </div>
            <Switch
              id="include-photo"
              checked={includePhoto}
              onCheckedChange={setIncludePhoto}
            />
          </div>

          <Button onClick={handleGenerateCV} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating CV...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate CV
              </>
            )}
          </Button>

          {/* Generated CV Display */}
          {generatedCV && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Generated CV</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCV, 'cv')}
                  >
                    {copiedCV ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsFile(generatedCV, `${profile.firstName}_${profile.lastName}_CV.${format === 'markdown' ? 'md' : format === 'html' ? 'html' : 'tex'}`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{generatedCV}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Letter Generator Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Cover Letter Generator
          </CardTitle>
          <CardDescription>
            Create a personalized cover letter for specific job applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Tech Corp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description (Optional)</Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for a more tailored cover letter..."
              rows={4}
            />
          </div>

          <Button onClick={handleGenerateCoverLetter} disabled={coverLetterLoading} className="w-full">
            {coverLetterLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </Button>

          {/* Generated Cover Letter Display */}
          {generatedCoverLetter && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Generated Cover Letter</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCoverLetter, 'coverLetter')}
                  >
                    {copiedCoverLetter ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsFile(generatedCoverLetter, `${profile.firstName}_${profile.lastName}_CoverLetter_${companyName.replace(/\s+/g, '_')}.txt`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{generatedCoverLetter}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

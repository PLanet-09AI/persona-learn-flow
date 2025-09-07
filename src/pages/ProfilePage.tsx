import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Settings,
  Plus,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  Target,
  Languages,
  Award,
  Download,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { paymentFirebaseService } from "@/services/paymentFirebase";
import { UserProfile } from "@/types/payment";
import { useToast } from "@/components/ui/use-toast";

export const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Location
    country: '',
    city: '',
    address: '',
    postalCode: '',
    
    // Professional Info
    currentJobTitle: '',
    currentCompany: '',
    industry: '',
    experienceLevel: 'entry' as 'entry' | 'junior' | 'mid' | 'senior' | 'executive',
    yearsOfExperience: '',
    
    // Education
    highestEducation: 'bachelor' as 'high_school' | 'diploma' | 'bachelor' | 'master' | 'phd' | 'other',
    fieldOfStudy: '',
    university: '',
    graduationYear: '',
    
    // Skills & Interests
    skills: [] as string[],
    interests: [] as string[],
    languages: [] as Array<{ language: string; proficiency: 'basic' | 'conversational' | 'fluent' | 'native' }>,
    
    // Career Goals
    careerGoals: '',
    targetJobTitle: '',
    targetIndustry: '',
    relocatingWillingness: false,
    remoteWorkPreference: 'no_preference' as 'office' | 'remote' | 'hybrid' | 'no_preference',
    
    // Learning Preferences
    field: '',
    learningStyle: 'visual' as 'visual' | 'auditory' | 'reading' | 'kinesthetic',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    
    // CV Settings
    cvTemplate: 'modern' as 'modern' | 'classic' | 'creative' | 'minimal',
    includePhoto: false
  });

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const userProfile = await paymentFirebaseService.getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            phone: userProfile.phone || '',
            dateOfBirth: userProfile.dateOfBirth ? userProfile.dateOfBirth.toISOString().split('T')[0] : '',
            country: userProfile.country,
            city: userProfile.city,
            address: userProfile.address || '',
            postalCode: userProfile.postalCode || '',
            currentJobTitle: userProfile.currentJobTitle || '',
            currentCompany: userProfile.currentCompany || '',
            industry: userProfile.industry,
            experienceLevel: userProfile.experienceLevel,
            yearsOfExperience: userProfile.yearsOfExperience?.toString() || '',
            highestEducation: userProfile.highestEducation,
            fieldOfStudy: userProfile.fieldOfStudy || '',
            university: userProfile.university || '',
            graduationYear: userProfile.graduationYear?.toString() || '',
            skills: userProfile.skills,
            interests: userProfile.interests,
            languages: userProfile.languages,
            careerGoals: userProfile.careerGoals,
            targetJobTitle: userProfile.targetJobTitle || '',
            targetIndustry: userProfile.targetIndustry || '',
            relocatingWillingness: userProfile.relocatingWillingness || false,
            remoteWorkPreference: userProfile.remoteWorkPreference || 'no_preference',
            field: userProfile.field,
            learningStyle: userProfile.learningStyle,
            level: userProfile.level,
            cvTemplate: userProfile.cvTemplate || 'modern',
            includePhoto: userProfile.includePhoto || false
          });
        } else {
          // Initialize with user email
          setFormData(prev => ({ ...prev, email: user.email }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
      }
    };

    loadProfile();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const profileData: Omit<UserProfile, 'id'> = {
        userId: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        country: formData.country,
        city: formData.city,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,
        currentJobTitle: formData.currentJobTitle || undefined,
        currentCompany: formData.currentCompany || undefined,
        industry: formData.industry,
        experienceLevel: formData.experienceLevel,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        highestEducation: formData.highestEducation,
        fieldOfStudy: formData.fieldOfStudy || undefined,
        university: formData.university || undefined,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        skills: formData.skills,
        interests: formData.interests,
        languages: formData.languages,
        careerGoals: formData.careerGoals,
        targetJobTitle: formData.targetJobTitle || undefined,
        targetIndustry: formData.targetIndustry || undefined,
        relocatingWillingness: formData.relocatingWillingness,
        remoteWorkPreference: formData.remoteWorkPreference,
        field: formData.field,
        learningStyle: formData.learningStyle,
        level: formData.level,
        cvTemplate: formData.cvTemplate,
        includePhoto: formData.includePhoto,
        createdAt: profile?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await paymentFirebaseService.saveUserProfile(profileData);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      // Reload profile
      const updatedProfile = await paymentFirebaseService.getUserProfile(user.id);
      setProfile(updatedProfile);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: 'basic' }]
    }));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return <div>Please sign in to access your profile.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Complete your profile to generate professional CVs and get personalized learning recommendations.
          </p>
        </div>
        
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Professional
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+27 12 345 6789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="South Africa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cape Town"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Information Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentJobTitle">Current Job Title</Label>
                  <Input
                    id="currentJobTitle"
                    value={formData.currentJobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentJobTitle: e.target.value }))}
                    placeholder="Software Developer"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                    placeholder="ABC Tech Solutions"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select 
                    value={formData.experienceLevel} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="junior">Junior (2-4 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (4-7 years)</SelectItem>
                      <SelectItem value="senior">Senior (7+ years)</SelectItem>
                      <SelectItem value="executive">Executive/Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="careerGoals">Career Goals *</Label>
                <Textarea
                  id="careerGoals"
                  value={formData.careerGoals}
                  onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
                  placeholder="Describe your career aspirations and goals..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetJobTitle">Target Job Title</Label>
                  <Input
                    id="targetJobTitle"
                    value={formData.targetJobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetJobTitle: e.target.value }))}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                
                <div>
                  <Label htmlFor="remoteWorkPreference">Remote Work Preference</Label>
                  <Select 
                    value={formData.remoteWorkPreference} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, remoteWorkPreference: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office Only</SelectItem>
                      <SelectItem value="remote">Remote Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="no_preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="highestEducation">Highest Education *</Label>
                  <Select 
                    value={formData.highestEducation} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, highestEducation: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">University/Institution</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                    placeholder="University of Cape Town"
                  />
                </div>
                
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                    placeholder="2020"
                    min="1950"
                    max="2030"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills & Languages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills Section */}
              <div>
                <Label htmlFor="skills">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="skillInput"
                    placeholder="Add a skill..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('skillInput') as HTMLInputElement;
                      addSkill(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Interests Section */}
              <div>
                <Label htmlFor="interests">Interests</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {formData.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {interest}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="interestInput"
                    placeholder="Add an interest..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addInterest((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('interestInput') as HTMLInputElement;
                      addInterest(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Languages Section */}
              <div>
                <Label>Languages</Label>
                <div className="space-y-3 mt-2">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder="Language"
                        value={lang.language}
                        onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                      />
                      <Select 
                        value={lang.proficiency} 
                        onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="fluent">Fluent</SelectItem>
                          <SelectItem value="native">Native</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLanguage}
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Learning & CV Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Learning Preferences */}
              <div className="space-y-4">
                <h4 className="font-semibold">Learning Preferences</h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="field">Field</Label>
                    <Input
                      id="field"
                      value={formData.field}
                      onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
                      placeholder="Technology"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="learningStyle">Learning Style</Label>
                    <Select 
                      value={formData.learningStyle} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, learningStyle: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="auditory">Auditory</SelectItem>
                        <SelectItem value="reading">Reading/Writing</SelectItem>
                        <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, level: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* CV Generation Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">CV Generation Settings</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cvTemplate">CV Template</Label>
                    <Select 
                      value={formData.cvTemplate} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, cvTemplate: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-7">
                    <Switch
                      id="includePhoto"
                      checked={formData.includePhoto}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includePhoto: checked }))}
                    />
                    <Label htmlFor="includePhoto">Include photo placeholder</Label>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate CV with AI
                  <Badge className="ml-2" variant="secondary">Coming Soon</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

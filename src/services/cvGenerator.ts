import { openRouterService } from './openrouter';
import { UserProfile } from '@/types/payment';

interface CVGenerationOptions {
  template: 'modern' | 'classic' | 'creative' | 'minimal';
  includePhoto: boolean;
  format: 'markdown' | 'html' | 'latex';
}

class CVGeneratorService {
  private cvTemplates = {
    modern: {
      name: 'Modern Professional',
      description: 'Clean, contemporary design with subtle colors',
      style: 'modern-professional'
    },
    classic: {
      name: 'Classic Traditional',
      description: 'Traditional, conservative layout for formal industries',
      style: 'classic-traditional'
    },
    creative: {
      name: 'Creative Design',
      description: 'Bold, creative layout for design and creative roles',
      style: 'creative-design'
    },
    minimal: {
      name: 'Minimal Clean',
      description: 'Ultra-clean, minimalist design',
      style: 'minimal-clean'
    }
  };

  /**
   * Generate CV content using AI based on user profile
   */
  async generateCV(
    profile: UserProfile, 
    options: CVGenerationOptions = {
      template: 'modern',
      includePhoto: false,
      format: 'markdown'
    }
  ): Promise<string> {
    const systemPrompt = this.getCVSystemPrompt(options);
    const userPrompt = this.buildUserProfilePrompt(profile, options);

    try {
      // Use Moonshot AI Kimi K2 for CV generation
      const cvContent = await openRouterService.askAboutContent(
        userPrompt,
        '',
        'moonshotai/kimi-k2:free',
        systemPrompt
      );

      return cvContent;
    } catch (error) {
      console.error('Error generating CV:', error);
      throw new Error('Failed to generate CV. Please try again.');
    }
  }

  /**
   * Generate cover letter using AI
   */
  async generateCoverLetter(
    profile: UserProfile,
    jobTitle: string,
    companyName: string,
    jobDescription?: string
  ): Promise<string> {
    const systemPrompt = `You are a professional career advisor and expert cover letter writer. 
    Create a compelling, personalized cover letter that:
    
    - Is professionally formatted and structured
    - Shows genuine interest in the specific role and company
    - Highlights relevant experience and skills from the user's profile
    - Demonstrates value the candidate can bring to the company
    - Uses professional but engaging language
    - Is approximately 250-350 words
    - Follows standard cover letter format with proper salutation and closing
    
    Make it ATS-friendly and avoid overly generic phrases. Focus on specific achievements and how they relate to the target role.`;

    const userPrompt = `Generate a cover letter for:
    
    **Target Position:** ${jobTitle}
    **Company:** ${companyName}
    ${jobDescription ? `**Job Description:** ${jobDescription}` : ''}
    
    **Candidate Profile:**
    - Name: ${profile.firstName} ${profile.lastName}
    - Current Role: ${profile.currentJobTitle || 'Job Seeker'}
    - Industry: ${profile.industry}
    - Experience Level: ${profile.experienceLevel}
    - Skills: ${profile.skills.join(', ')}
    - Career Goals: ${profile.careerGoals}
    - Location: ${profile.city}, ${profile.country}
    
    **Key Qualifications:**
    - Education: ${profile.highestEducation} ${profile.fieldOfStudy ? `in ${profile.fieldOfStudy}` : ''}
    - Years of Experience: ${profile.yearsOfExperience || 'Entry level'}
    - Target Industry: ${profile.targetIndustry || profile.industry}
    
    Create a compelling cover letter that positions this candidate as the ideal fit for the role.`;

    try {
      const coverLetter = await openRouterService.askAboutContent(
        userPrompt,
        '',
        'moonshotai/kimi-k2:free',
        systemPrompt
      );

      return coverLetter;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw new Error('Failed to generate cover letter. Please try again.');
    }
  }

  /**
   * Get system prompt for CV generation
   */
  private getCVSystemPrompt(options: CVGenerationOptions): string {
    const templateInfo = this.cvTemplates[options.template];
    
    return `You are an expert CV/Resume writer and career advisor with extensive knowledge of industry best practices, ATS optimization, and modern recruitment standards.

**Your Mission:**
Create a professional, compelling CV that showcases the candidate's strengths, achievements, and potential. The CV should be tailored to their career goals and optimized for both human recruiters and Applicant Tracking Systems (ATS).

**CV Template Style:** ${templateInfo.name} - ${templateInfo.description}

**Formatting Requirements:**
${options.format === 'markdown' ? `
- Use clean Markdown formatting
- Use ## for main sections (Professional Summary, Experience, Education, etc.)
- Use ### for subsections and job titles
- Use bullet points (-) for achievements and responsibilities
- Use **bold** for important elements like company names and job titles
- Use *italics* for dates and locations
` : ''}

**Essential Sections (in order):**
1. **Header** - Name, contact info, location${options.includePhoto ? ', [Photo Placement]' : ''}
2. **Professional Summary** - Compelling 3-4 line summary highlighting key strengths
3. **Core Skills** - Relevant technical and soft skills
4. **Professional Experience** - Detailed work history with quantified achievements
5. **Education** - Academic qualifications
6. **Additional Sections** - Languages, Certifications, Projects (if applicable)

**Content Guidelines:**
- Start each bullet point with strong action verbs
- Quantify achievements with numbers, percentages, or metrics where possible
- Focus on results and impact, not just responsibilities
- Use industry-relevant keywords for ATS optimization
- Keep descriptions concise but impactful
- Tailor content to the candidate's career goals and target industry
- Ensure consistency in formatting, tense, and style

**Professional Writing Standards:**
- Use professional, confident tone
- Avoid first person pronouns (I, me, my)
- Use present tense for current roles, past tense for previous roles
- Maintain consistency in date formats and bullet point styles
- Ensure error-free grammar and spelling

Create a CV that positions this candidate as a strong contender for their target roles while maintaining authenticity and professionalism.`;
  }

  /**
   * Build user profile prompt for CV generation
   */
  private buildUserProfilePrompt(profile: UserProfile, options: CVGenerationOptions): string {
    const skillsText = profile.skills.length > 0 ? profile.skills.join(', ') : 'Not specified';
    const languagesText = profile.languages.length > 0 
      ? profile.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ')
      : 'Not specified';

    return `Create a professional CV for the following candidate:

**PERSONAL INFORMATION:**
- Full Name: ${profile.firstName} ${profile.lastName}
- Email: ${profile.email}
- Phone: ${profile.phone || 'To be added'}
- Location: ${profile.city}, ${profile.country}
- Date of Birth: ${profile.dateOfBirth ? profile.dateOfBirth.toLocaleDateString() : 'Not specified'}

**PROFESSIONAL BACKGROUND:**
- Current Position: ${profile.currentJobTitle || 'Seeking new opportunities'}
- Current Company: ${profile.currentCompany || 'N/A'}
- Industry: ${profile.industry}
- Experience Level: ${profile.experienceLevel}
- Years of Experience: ${profile.yearsOfExperience || 'Entry level'}

**CAREER OBJECTIVES:**
- Career Goals: ${profile.careerGoals}
- Target Job Title: ${profile.targetJobTitle || 'Open to opportunities'}
- Target Industry: ${profile.targetIndustry || profile.industry}
- Remote Work Preference: ${profile.remoteWorkPreference}
- Willing to Relocate: ${profile.relocatingWillingness ? 'Yes' : 'No'}

**EDUCATION:**
- Highest Education: ${profile.highestEducation}
- Field of Study: ${profile.fieldOfStudy || 'Not specified'}
- Institution: ${profile.university || 'Not specified'}
- Graduation Year: ${profile.graduationYear || 'Not specified'}

**SKILLS & COMPETENCIES:**
- Technical/Professional Skills: ${skillsText}
- Languages: ${languagesText}
- Learning Style: ${profile.learningStyle} learner

**INTERESTS & PERSONAL DEVELOPMENT:**
- Interests: ${profile.interests.join(', ') || 'Not specified'}
- Field of Learning Focus: ${profile.field}
- Current Learning Level: ${profile.level}

**CV TEMPLATE PREFERENCES:**
- Template Style: ${options.template}
- Include Photo: ${options.includePhoto ? 'Yes' : 'No'}

**SPECIAL INSTRUCTIONS:**
- Since this is a generated CV based on profile information, you may need to create realistic but generic work experience entries if specific experience details are not provided
- Focus on the candidate's stated career goals and target industry
- Highlight transferable skills and potential
- If work experience is limited, emphasize education, projects, volunteer work, and skill development
- Make sure the CV is tailored to the ${profile.industry} industry
- Optimize for ${profile.experienceLevel} level positions

Generate a comprehensive, professional CV that showcases this candidate's potential and aligns with their career objectives.`;
  }

  /**
   * Get available CV templates
   */
  getAvailableTemplates() {
    return this.cvTemplates;
  }
}

export const cvGeneratorService = new CVGeneratorService();

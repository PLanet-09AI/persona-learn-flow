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
    console.log('🎯 CV Generation Started');
    console.log('📋 Profile:', {
      name: `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
      industry: profile.industry,
      experienceLevel: profile.experienceLevel,
      skillsCount: profile.skills?.length || 0,
      languagesCount: profile.languages?.length || 0
    });
    console.log('⚙️ Options:', options);

    const systemPrompt = this.getCVSystemPrompt(options);
    const userPrompt = this.buildUserProfilePrompt(profile, options);

    console.log('📝 System prompt length:', systemPrompt.length, 'characters');
    console.log('📝 User prompt length:', userPrompt.length, 'characters');
    console.log('🤖 Using model: cognitivecomputations/dolphin-mistral-24b-venice-edition:free');

    try {
      console.log('⏳ Sending request to OpenRouter API...');
      const startTime = Date.now();

      // Use Dolphin Mistral for structured CV generation
      const cvContent = await openRouterService.askAboutContent(
        userPrompt,
        '',
        'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        systemPrompt
      );

      const duration = Date.now() - startTime;
      console.log(`✅ CV Generated Successfully in ${duration}ms`);
      console.log('📄 CV Content length:', cvContent.length, 'characters');
      console.log('📄 CV Preview (first 200 chars):', cvContent.substring(0, 200) + '...');

      return cvContent;
    } catch (error) {
      console.error('❌ Error generating CV:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        profile: profile.email,
        options
      });
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
    console.log('✉️ Cover Letter Generation Started');
    console.log('🎯 Target Job:', jobTitle, 'at', companyName);
    console.log('📋 Candidate:', `${profile.firstName} ${profile.lastName}`, '-', profile.experienceLevel);
    console.log('📝 Job Description provided:', !!jobDescription);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `You are a professional career advisor and expert cover letter writer. 
    Create a compelling, personalized cover letter that:
    
    - Uses the ACTUAL candidate information provided (no placeholders like [Your Name] or [Email])
    - Is professionally formatted and ready to copy-paste
    - Shows genuine interest in the specific role and company
    - Highlights relevant experience and skills from the user's profile
    - Demonstrates value the candidate can bring to the company
    - Uses professional but engaging language
    - Is approximately 250-350 words
    - Follows standard cover letter format with proper salutation and closing
    
    CRITICAL: Replace ALL placeholders with the actual information provided in the candidate profile. 
    Do NOT use brackets like [Your Name], [Email], [Phone], etc. Use the real data.
    
    Make it ATS-friendly and avoid overly generic phrases. Focus on specific achievements and how they relate to the target role.`;

    const userPrompt = `Generate a cover letter for:
    
    **Target Position:** ${jobTitle}
    **Company:** ${companyName}
    ${jobDescription ? `**Job Description:** ${jobDescription}` : ''}
    
    **Candidate Profile (USE THIS EXACT INFORMATION - NO PLACEHOLDERS):**
    - Full Name: ${profile.firstName} ${profile.lastName}
    - Email: ${profile.email}
    - Phone: ${profile.phone || 'Not provided'}
    - Address: ${profile.address || ''} ${profile.city}, ${profile.country} ${profile.postalCode || ''}
    - Current Role: ${profile.currentJobTitle || 'Job Seeker'}
    - Current Company: ${profile.currentCompany || 'Seeking opportunities'}
    - Industry: ${profile.industry}
    - Experience Level: ${profile.experienceLevel}
    - Years of Experience: ${profile.yearsOfExperience || 'Entry level'}
    - Skills: ${profile.skills.join(', ')}
    - Career Goals: ${profile.careerGoals}
    - Target Industry: ${profile.targetIndustry || profile.industry}
    - Education: ${profile.highestEducation} ${profile.fieldOfStudy ? `in ${profile.fieldOfStudy}` : ''}
    - University: ${profile.university || 'Not specified'}
    - Languages: ${profile.languages?.map(lang => `${lang.language} (${lang.proficiency})`).join(', ') || 'English'}
    
    **Date:** ${today}
    
    **IMPORTANT INSTRUCTIONS:**
    1. Use the EXACT name "${profile.firstName} ${profile.lastName}" - not [Your Name]
    2. Use the EXACT email "${profile.email}" - not [Email]
    3. Use the EXACT phone "${profile.phone || 'Available upon request'}" - not [Phone]
    4. Use the EXACT location "${profile.city}, ${profile.country}" - not [Your Address]
    5. Use today's date: ${today}
    6. Address the letter to the hiring team at ${companyName}
    7. Make it ready to copy and paste - no placeholders whatsoever
    
    Create a compelling, professional cover letter that is COMPLETE and ready to use immediately.`;

    console.log('📝 System prompt length:', systemPrompt.length, 'characters');
    console.log('📝 User prompt length:', userPrompt.length, 'characters');
    console.log('🤖 Using model: cognitivecomputations/dolphin-mistral-24b-venice-edition:free');

    try {
      console.log('⏳ Sending request to OpenRouter API...');
      const startTime = Date.now();

      const coverLetter = await openRouterService.askAboutContent(
        userPrompt,
        '',
        'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        systemPrompt
      );

      const duration = Date.now() - startTime;
      console.log(`✅ Cover Letter Generated Successfully in ${duration}ms`);
      console.log('📄 Cover Letter length:', coverLetter.length, 'characters');
      console.log('📄 Cover Letter Preview (first 150 chars):', coverLetter.substring(0, 150) + '...');

      return coverLetter;
    } catch (error) {
      console.error('❌ Error generating cover letter:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        jobTitle,
        companyName,
        profile: profile.email
      });
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

**CRITICAL REQUIREMENT:**
- Use ONLY the actual candidate information provided
- DO NOT use placeholders like [Your Name], [Email], [Phone], [Address], etc.
- Replace ALL brackets and placeholder text with the real candidate data
- The CV must be 100% ready to copy and paste without any editing needed

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
1. **Header** - Name, contact info, location${options.includePhoto ? ' | [PHOTO PLACEHOLDER: Professional headshot, 4x5cm or 2x2.5 inches, placed on the right or left of contact info]' : ''}
2. **Professional Summary** - Compelling 3-4 line summary highlighting key strengths
3. **Core Skills** - Relevant technical and soft skills (organized by category if applicable)
4. **Professional Experience** - Detailed work history with quantified achievements
5. **Education** - Academic qualifications and certifications
6. **Languages** - Language proficiency if applicable
7. **Additional Sections** - Certifications, Projects, Volunteer Work, Publications (if applicable)

**Content Guidelines:**
- Start each bullet point with strong action verbs
- Quantify achievements with numbers, percentages, or metrics where possible
- Focus on results and impact, not just responsibilities
- Use industry-relevant keywords for ATS optimization
- Keep descriptions concise but impactful
- Tailor content to the candidate's career goals and target industry
- Ensure consistency in formatting, tense, and style
- Use the EXACT name, email, phone, and address provided - no placeholders
${options.includePhoto ? `
**Photo Placeholder Guidelines:**
- Include a clear placeholder section for a professional headshot
- Recommended size: 4x5cm (1.6x2 inches) or 2x2.5 inches
- Position: Typically in the top-right corner or next to contact information
- Style: Professional, formal business attire, good lighting, neutral background
- Use clear text like "[INSERT PROFESSIONAL HEADSHOT HERE]" or similar placeholder
- Ensure the placeholder is easily identifiable for the user to replace with their actual photo
` : ''}

**Professional Writing Standards:**
- Use professional, confident tone
- Avoid first person pronouns (I, me, my)
- Use present tense for current roles, past tense for previous roles
- Maintain consistency in date formats and bullet point styles
- Ensure error-free grammar and spelling
- NO placeholders - use real data only

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

    return `Create a professional CV for the following candidate. USE THE EXACT INFORMATION PROVIDED - NO PLACEHOLDERS.

**PERSONAL INFORMATION (USE THESE EXACT VALUES):**
- Full Name: ${profile.firstName} ${profile.lastName}
- Email: ${profile.email}
- Phone: ${profile.phone || 'Available upon request'}
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

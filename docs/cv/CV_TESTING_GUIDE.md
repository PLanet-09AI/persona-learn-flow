# CV Generator - Testing Guide

## Quick Start Testing

### Prerequisites
```bash
# Ensure dependencies are installed
npm install

# Build should pass
npm run build

# Start dev server
npm run dev
```

## Test Scenarios

### 1. CV Generation - Basic Flow ✅

**Steps:**
1. Navigate to CV Generator page
2. Ensure "CV Generator" tab is active (should be default)
3. Select "Professional" template
4. Select "Markdown" format
5. Toggle photo inclusion ON
6. Click "Generate CV"
7. Wait for generation (loading spinner should appear)
8. Verify CV appears in preview panel

**Expected Results:**
- ✅ CV contains actual user data (no placeholders like [Your Name])
- ✅ CV includes photo section mention if toggled ON
- ✅ CV follows selected template style
- ✅ Format matches selection (Markdown formatting visible)
- ✅ Action buttons appear (Copy, Download, Export PDF)

### 2. CV Export Options ✅

**Steps:**
1. After generating CV (from Test 1)
2. Click "Copy" button
3. Paste into text editor - verify content matches preview
4. Click "Download" button
5. Verify file downloads as `.md`, `.html`, or `.tex` depending on format
6. Click "Export PDF" button
7. Verify PDF downloads with proper filename format

**Expected Results:**
- ✅ Copy: Content in clipboard matches preview
- ✅ Download: Text file with correct extension
- ✅ Export PDF: PDF file named `FirstName_LastName_CV.pdf`
- ✅ PDF contains all content with proper formatting
- ✅ PDF has multiple pages if content is long
- ✅ Toast notifications appear for each action

### 3. Cover Letter Generation - Basic Flow ✅

**Steps:**
1. Click "Cover Letter" tab
2. Enter job title: "Software Developer"
3. Enter company name: "TechCorp"
4. Leave job description empty (test without it first)
5. Click "Generate Cover Letter"
6. Wait for generation
7. Verify cover letter appears in preview

**Expected Results:**
- ✅ Letter contains actual user name, email, phone (no placeholders)
- ✅ Letter mentions job title and company name correctly
- ✅ Letter includes today's date at top
- ✅ Professional business letter format
- ✅ Action buttons appear (Copy, Download, Export PDF)

### 4. Cover Letter with Job Description ✅

**Steps:**
1. Still on "Cover Letter" tab
2. Clear previous inputs (or refresh)
3. Enter job title: "Full Stack Engineer"
4. Enter company name: "StartupXYZ"
5. Paste sample job description (any job posting)
6. Click "Generate Cover Letter"
7. Compare with letter from Test 3

**Expected Results:**
- ✅ Letter is more tailored to job description
- ✅ References specific requirements from job posting
- ✅ Still maintains professional tone
- ✅ No generic filler text

### 5. Cover Letter Export Options ✅

**Steps:**
1. After generating cover letter (from Test 3 or 4)
2. Click "Copy" button
3. Paste into text editor - verify content
4. Click "Download" button
5. Verify file downloads as `.txt`
6. Click "Export PDF" button
7. Verify PDF downloads

**Expected Results:**
- ✅ Copy: Full letter in clipboard
- ✅ Download: Text file named `FirstName_LastName_CoverLetter_CompanyName.txt`
- ✅ Export PDF: PDF named `FirstName_LastName_CoverLetter_CompanyName.pdf`
- ✅ PDF formatted as professional business letter
- ✅ Proper margins and typography

### 6. Tab Switching ✅

**Steps:**
1. Generate a CV (Test 1)
2. Switch to "Cover Letter" tab
3. Generate a cover letter (Test 3)
4. Switch back to "CV Generator" tab
5. Switch back to "Cover Letter" tab

**Expected Results:**
- ✅ Generated CV persists when switching tabs
- ✅ Generated cover letter persists when switching tabs
- ✅ No data loss when switching between tabs
- ✅ All action buttons remain functional

### 7. Free Tier Limits ✅

**Steps:**
1. Start with fresh user account (0 generations)
2. Check banner shows "3 free generations remaining"
3. Generate CV - check banner updates to "2 remaining"
4. Generate cover letter - check banner updates to "1 remaining"
5. Generate CV again - check banner updates to "0 remaining"
6. Try to generate again - should be blocked

**Expected Results:**
- ✅ Banner shows correct remaining count
- ✅ Counter decrements with each generation
- ✅ Both CV and cover letter count toward same limit
- ✅ At 0 remaining, banner turns orange
- ✅ "Subscribe Now" button appears
- ✅ Generation is blocked (toast error appears)

### 8. Paid Tier Activation ✅

**Steps:**
1. User with 0 free generations
2. Complete subscription payment (Yoco)
3. Return to CV Generator
4. Check banner shows "Premium Active"
5. Verify shows "20 paid generations remaining"
6. Generate CV - verify count decrements

**Expected Results:**
- ✅ Banner turns blue for Premium
- ✅ Shows both free (0/3) and paid (20/20) counts
- ✅ Can generate even with free tier exhausted
- ✅ Paid count decrements correctly
- ✅ Free count stays at 0

### 9. Responsive Design ✅

**Desktop (≥1024px):**
- ✅ Side-by-side layout (1/3 controls, 2/3 preview)
- ✅ All content visible without scrolling
- ✅ Tabs span full width

**Tablet (768px - 1023px):**
- ✅ Controls and preview stack vertically
- ✅ Tabs still horizontal
- ✅ All features accessible

**Mobile (<768px):**
- ✅ Single column layout
- ✅ Tabs stack (or horizontal scroll)
- ✅ Buttons full width
- ✅ Preview scrollable

### 10. Empty States ✅

**Steps:**
1. Navigate to CV Generator (no generation yet)
2. Check CV preview area
3. Switch to Cover Letter tab
4. Check cover letter preview area

**Expected Results:**
- ✅ CV tab shows empty state with file icon
- ✅ Message: "No CV Generated Yet"
- ✅ Helper text: "Select your preferences and click 'Generate CV'"
- ✅ Cover letter tab shows empty state with mail icon
- ✅ Message: "No Cover Letter Generated Yet"
- ✅ Helper text about filling job details

### 11. Validation ✅

**Cover Letter Tab:**
1. Navigate to Cover Letter tab
2. Leave job title and company empty
3. Try clicking "Generate Cover Letter"

**Expected Results:**
- ✅ Button is disabled (grayed out)
- ✅ Cannot click button
- ✅ Fill in job title only - button still disabled
- ✅ Fill in both fields - button becomes enabled

### 12. Error Handling ✅

**Simulate API Error:**
1. Disconnect internet or block OpenRouter API
2. Try generating CV
3. Check error handling

**Expected Results:**
- ✅ Loading spinner shows briefly
- ✅ Error toast appears with message
- ✅ Preview area returns to empty state or previous content
- ✅ User can try again

**PDF Export Error:**
1. Generate CV or cover letter
2. Modify exportToPDF to force error (for testing)
3. Try exporting PDF

**Expected Results:**
- ✅ Error toast appears
- ✅ Falls back to text download
- ✅ User still gets the content

### 13. Profile Integration ✅

**Steps:**
1. Check Profile Summary section at bottom
2. Verify it shows current user data
3. Update profile information
4. Return to CV Generator
5. Generate new CV
6. Verify CV uses updated data

**Expected Results:**
- ✅ Profile summary shows correct user info
- ✅ Shows skills, experience level, target role
- ✅ CV generation uses latest profile data
- ✅ No cached/stale data in generated content

### 14. Multiple Formats ✅

**Steps:**
1. Generate CV in Markdown format
2. Export as PDF
3. Change format to HTML
4. Generate new CV
5. Export as PDF
6. Change format to LaTeX
7. Generate new CV
8. Export as PDF

**Expected Results:**
- ✅ Each format shows proper formatting in preview
- ✅ Markdown: Clean plain text with # headers
- ✅ HTML: Shows HTML tags like `<h1>`, `<p>`
- ✅ LaTeX: Shows LaTeX commands like `\section{}`
- ✅ All PDFs generate successfully regardless of source format

### 15. Copy Button States ✅

**Steps:**
1. Generate CV
2. Click "Copy" button
3. Observe button icon change
4. Wait 2 seconds
5. Click "Copy" again

**Expected Results:**
- ✅ Button shows copy icon initially
- ✅ After click, icon changes to checkmark
- ✅ After 2 seconds, reverts to copy icon
- ✅ Same behavior for cover letter copy button

## Performance Testing

### Load Time
- ✅ Page loads in <2 seconds
- ✅ Tabs switch instantly
- ✅ No layout shift on initial load

### Generation Speed
- ✅ CV generation completes in <10 seconds
- ✅ Cover letter generation completes in <10 seconds
- ✅ Loading spinner shows during generation
- ✅ UI remains responsive during generation

### PDF Export Speed
- ✅ PDF generation completes in <3 seconds
- ✅ No UI freezing during PDF creation
- ✅ Toast notification appears promptly

## Accessibility Testing

### Keyboard Navigation
- ✅ Tab through all controls in logical order
- ✅ Enter key activates buttons
- ✅ Space key toggles switches
- ✅ Arrow keys navigate selects

### Screen Reader
- ✅ Labels properly announced
- ✅ Button purposes clear
- ✅ Error messages announced
- ✅ State changes communicated

### Color Contrast
- ✅ All text meets WCAG AA standards
- ✅ Buttons have sufficient contrast
- ✅ Disabled states clearly visible

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Known Issues

### Non-Critical
- CSS minification warning in build (doesn't affect functionality)
- Large bundle size (~1MB) - future optimization opportunity

### To Monitor
- PDF generation on older devices
- Very long CVs (>10 pages) PDF performance
- Special characters in company names for filenames

## Test Data

### Sample User Profile
```
Name: John Doe
Email: john.doe@example.com
Phone: +1 (555) 123-4567
Industry: Technology
Experience Level: Senior
Target Job: Full Stack Developer
Skills: JavaScript, React, Node.js, Python, AWS, Docker
```

### Sample Job Description
```
Full Stack Engineer at StartupXYZ

We're looking for an experienced full stack developer to join our team.

Requirements:
- 5+ years experience with JavaScript
- Strong React and Node.js skills
- Experience with AWS and Docker
- Excellent communication skills

Responsibilities:
- Build and maintain web applications
- Collaborate with design team
- Write clean, maintainable code
- Mentor junior developers
```

## Success Criteria

All tests should pass with:
- ✅ No TypeScript errors
- ✅ No runtime errors in console
- ✅ No broken functionality
- ✅ Proper data handling
- ✅ Good user experience

---

**Last Updated**: January 2025
**Status**: Ready for Testing
**Priority**: High - New Feature

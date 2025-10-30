# CV Generator - New UI Layout

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GENERATION LIMITS BANNER                        │
│  ⭐ Premium Active - 20 paid generations remaining                  │
│     Free: 3/3 | Paid: 20/20                                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┬─────────────────────┐                      │
│  │  📄 CV Generator    │  ✉️ Cover Letter    │  ← TABS              │
│  └─────────────────────┴─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘

TAB 1: CV GENERATOR
┌───────────────────────────┬─────────────────────────────────────────┐
│    CV SETTINGS (1/3)      │         CV PREVIEW (2/3)                │
│ ┌───────────────────────┐ │ ┌─────────────────────────────────────┐ │
│ │ Template Style        │ │ │ CV Preview                          │ │
│ │ ▼ Professional        │ │ │ [Copy] [Download] [Export PDF]      │ │
│ │                       │ │ ├─────────────────────────────────────┤ │
│ │ Output Format         │ │ │                                     │ │
│ │ ▼ Markdown            │ │ │   JOHN DOE                          │ │
│ │                       │ │ │   Software Developer                │ │
│ │ 📷 Include Photo      │ │ │   Email: john@example.com           │ │
│ │    [Toggle]           │ │ │                                     │ │
│ │                       │ │ │   PROFESSIONAL SUMMARY              │ │
│ │───────────────────────│ │ │   Experienced developer with...     │ │
│ │                       │ │ │                                     │ │
│ │ [Generate CV Button]  │ │ │   EXPERIENCE                        │ │
│ │                       │ │ │   • Senior Developer                │ │
│ └───────────────────────┘ │ │     TechCorp (2020-Present)         │ │
│                           │ │                                     │ │
│                           │ │   EDUCATION                         │ │
│                           │ │   • BSc Computer Science            │ │
│                           │ │                                     │ │
│                           │ │   SKILLS                            │ │
│                           │ │   JavaScript, React, Node.js...     │ │
│                           │ └─────────────────────────────────────┘ │
└───────────────────────────┴─────────────────────────────────────────┘

TAB 2: COVER LETTER
┌───────────────────────────┬─────────────────────────────────────────┐
│   JOB DETAILS (1/3)       │    COVER LETTER PREVIEW (2/3)           │
│ ┌───────────────────────┐ │ ┌─────────────────────────────────────┐ │
│ │ Job Title *           │ │ │ Cover Letter Preview                │ │
│ │ [Software Developer]  │ │ │ For Software Developer at TechCorp  │ │
│ │                       │ │ │ [Copy] [Download] [Export PDF]      │ │
│ │ Company Name *        │ │ ├─────────────────────────────────────┤ │
│ │ [TechCorp]            │ │ │                                     │ │
│ │                       │ │ │   January 15, 2025                  │ │
│ │ Job Description       │ │ │                                     │ │
│ │ [Optional textarea]   │ │ │   Dear Hiring Manager,              │ │
│ │                       │ │ │                                     │ │
│ │                       │ │ │   I am writing to express my        │ │
│ │                       │ │ │   strong interest in the Software   │ │
│ │ Paste job posting...  │ │ │   Developer position at TechCorp.   │ │
│ │                       │ │ │                                     │ │
│ │                       │ │ │   With 5 years of experience in     │ │
│ │                       │ │ │   full-stack development...         │ │
│ │───────────────────────│ │ │                                     │ │
│ │                       │ │ │   I am particularly drawn to        │ │
│ │ [Generate Letter]     │ │ │   TechCorp's commitment to...       │ │
│ │                       │ │ │                                     │ │
│ └───────────────────────┘ │ │   Thank you for considering my      │ │
│                           │ │   application.                       │ │
│                           │ │                                     │ │
│                           │ │   Sincerely,                        │ │
│                           │ │   John Doe                          │ │
│                           │ └─────────────────────────────────────┘ │
└───────────────────────────┴─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        PROFILE SUMMARY                              │
│  Name: John Doe              Industry: Technology                   │
│  Experience: Senior          Target: Full Stack Developer           │
│  Skills: JavaScript, React, Node.js, Python... +15 more             │
│                                                                     │
│  💡 Tip: Keep your profile updated for better results              │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features by Section

### 1. Generation Limits Banner
- **Color-coded**: Blue (active), Orange (limit reached)
- **Dynamic stats**: Shows free (3) and paid (20) generations
- **Subscribe button**: Appears when free tier exhausted

### 2. Tabbed Interface
- **Tab 1 - CV Generator**: Professional CV generation
- **Tab 2 - Cover Letter**: Job-specific letter generation
- Icons for quick visual identification

### 3. Left Panel (1/3 width)
**CV Tab:**
- Template dropdown (Professional, Modern, Academic, etc.)
- Format dropdown (Markdown, HTML, LaTeX)
- Photo toggle with description
- Large generate button

**Cover Letter Tab:**
- Job title input (required)
- Company name input (required)
- Job description textarea (optional, 8 rows)
- Helper text below textarea
- Large generate button (disabled until required fields filled)

### 4. Right Panel (2/3 width)
**Both Tabs:**
- Large preview area (min 600px height)
- Action buttons in header: Copy, Download, Export PDF
- Empty state with icon when no content
- Professional white background
- Proper text formatting

### 5. Empty States
**CV Tab:**
```
    📄 (Large icon)
    No CV Generated Yet
    Select your preferences and click "Generate CV"
```

**Cover Letter Tab:**
```
    ✉️ (Large icon)
    No Cover Letter Generated Yet
    Fill in the job details and click "Generate Cover Letter"
```

## Responsive Behavior

### Desktop (≥1024px)
- Side-by-side layout (1/3 controls, 2/3 preview)
- Full width up to 1280px (max-w-7xl)
- Tabs span full width

### Tablet (768px - 1023px)
- Stacked layout (controls above preview)
- Full width tabs
- Preview area still large and readable

### Mobile (<768px)
- Single column layout
- Tabs stack vertically
- Controls full width
- Preview full width
- All functionality preserved

## Color Scheme

### Light Mode
- Background: White (`bg-white`)
- Cards: White with borders
- Accents: Blue for primary actions
- Text: Dark gray

### Dark Mode
- Background: Dark gray (`bg-gray-950`)
- Cards: Dark with subtle borders
- Accents: Blue for primary actions
- Text: Light gray

## Typography

### Headings
- Card titles: `text-xl` (20px)
- Section labels: `text-base font-semibold` (16px)
- Descriptions: `text-sm text-muted-foreground` (14px)

### Content
- CV preview: Default font
- Cover letter: `font-serif` for professional look
- Both: `leading-relaxed` for readability

## Spacing

### Padding
- Cards: Standard padding
- Preview area: `p-8` (32px) for comfortable reading
- Controls: `space-y-6` (24px) between sections

### Margins
- Top container: `p-6` (24px)
- Section spacing: `space-y-6` (24px)
- Grid gap: `gap-6` (24px)

## Action Buttons

### Three Types
1. **Copy**: Outline style, clipboard icon
2. **Download**: Outline style, download icon (saves as text)
3. **Export PDF**: Primary style, file/mail icon (saves as PDF)

### Button Sizes
- Generate buttons: `h-12` (48px) - Large and prominent
- Action buttons: `size="sm"` - Compact but clickable
- All buttons: Proper icon spacing (`mr-2`)

## PDF Export Details

### CV PDF
- Filename: `FirstName_LastName_CV.pdf`
- Orientation: Portrait
- Format: A4
- Font: Helvetica 10pt
- Margins: 15mm
- Auto-pagination

### Cover Letter PDF
- Filename: `FirstName_LastName_CoverLetter_CompanyName.pdf`
- Orientation: Portrait
- Format: A4
- Font: Helvetica 10pt (serif-style)
- Margins: 15mm
- Auto-pagination
- Professional letter formatting

## User Flow

### CV Generation
1. User clicks "CV Generator" tab (if not already active)
2. Selects template style from dropdown
3. Selects output format (Markdown/HTML/LaTeX)
4. Toggles photo inclusion if desired
5. Clicks "Generate CV" button
6. CV appears in right panel preview
7. User can Copy, Download (text), or Export PDF

### Cover Letter Generation
1. User clicks "Cover Letter" tab
2. Enters job title (required)
3. Enters company name (required)
4. Optionally pastes job description
5. Clicks "Generate Cover Letter" button
6. Cover letter appears in right panel preview
7. User can Copy, Download (text), or Export PDF

## Accessibility

- **Keyboard navigation**: All controls accessible via Tab
- **Screen readers**: Proper labels and ARIA attributes
- **Focus indicators**: Clear focus states on all interactive elements
- **Color contrast**: Meets WCAG AA standards
- **Touch targets**: Minimum 44x44px for mobile
- **Error states**: Clear validation messages

## Performance

- **Code splitting**: jsPDF loaded dynamically on demand
- **Build size**: Total ~1.03MB gzipped
- **PDF generation**: Async with loading states
- **No blocking**: Generation happens in background
- **Error handling**: Graceful fallbacks if PDF fails

---

**Status**: ✅ Complete and Production Ready
**Build Time**: 4.69s
**Errors**: None
**Warnings**: CSS minification warning (non-critical)

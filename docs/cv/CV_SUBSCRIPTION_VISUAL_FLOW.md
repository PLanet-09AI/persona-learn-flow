# CV Subscription System - Visual Flow Guide

## 🎯 Complete User Journey

---

## 1️⃣ NEW USER SIGNS UP

```
┌─────────────────────────────────────────────┐
│         Welcome to Persona Learn!          │
│                                             │
│  [Sign Up] → Account Created ✅             │
│                                             │
│  System automatically creates:              │
│  ┌───────────────────────────────────────┐ │
│  │ cvGenerations/userId:                 │ │
│  │  {                                    │ │
│  │    freeGenerationsUsed: 0,            │ │
│  │    paidGenerationsUsed: 0,            │ │
│  │    hasPaidSubscription: false,        │ │
│  │    totalGenerations: 0                │ │
│  │  }                                    │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ✅ You have 3 free CV generations!        │
└─────────────────────────────────────────────┘
```

---

## 2️⃣ USING FREE GENERATIONS

### Generation #1
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  📊 Status Banner:                          │
│  ┌───────────────────────────────────────┐ │
│  │ 💎 Free Tier                          │ │
│  │ 3/3 free generations remaining        │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Generate CV] → Click                      │
│                                             │
│  ✅ CV Generated!                           │
│  Updated: freeGenerationsUsed: 1            │
└─────────────────────────────────────────────┘
```

### Generation #2
```
┌─────────────────────────────────────────────┐
│  📊 Status Banner:                          │
│  ┌───────────────────────────────────────┐ │
│  │ 💎 Free Tier                          │ │
│  │ 2/3 free generations remaining        │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Generate CV] → Click                      │
│                                             │
│  ✅ CV Generated!                           │
│  Updated: freeGenerationsUsed: 2            │
└─────────────────────────────────────────────┘
```

### Generation #3 (Last Free)
```
┌─────────────────────────────────────────────┐
│  📊 Status Banner:                          │
│  ┌───────────────────────────────────────┐ │
│  │ 💎 Free Tier                          │ │
│  │ 1/3 free generations remaining        │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Generate CV] → Click                      │
│                                             │
│  ✅ CV Generated!                           │
│  Updated: freeGenerationsUsed: 3            │
│                                             │
│  ⚠️  This was your last free generation!   │
└─────────────────────────────────────────────┘
```

### All Free Used - BLOCKED
```
┌─────────────────────────────────────────────┐
│  📊 Status Banner:                          │
│  ┌───────────────────────────────────────┐ │
│  │ 💎 Free Tier                          │ │
│  │ 0/3 free generations remaining        │ │
│  │                                       │ │
│  │ Subscribe to unlock 20 more           │ │
│  │ CV generations!                       │ │
│  │                                       │ │
│  │              [Subscribe Now] 🔵       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Generate CV] → Click                      │
│                                             │
│  ❌ BLOCKED!                                │
│  ┌───────────────────────────────────────┐ │
│  │ ⚠️ Generation Limit Reached           │ │
│  │                                       │ │
│  │ You have used all 3 free CV           │ │
│  │ generations. Subscribe to unlock      │ │
│  │ 20 more generations!                  │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 3️⃣ SUBSCRIPTION FLOW

### Step 1: Click Subscribe Now
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  [Subscribe Now] 🔵 → User Clicks           │
│                                             │
│            ↓                                │
│     Navigate to /profile                    │
└─────────────────────────────────────────────┘
```

### Step 2: Choose Plan
```
┌─────────────────────────────────────────────┐
│          Profile Page                       │
│                                             │
│  💎 Subscription Plans                      │
│                                             │
│  ┌─────────────┐  ┌─────────────┐         │
│  │  Monthly    │  │   Yearly    │         │
│  │  R299/mo    │  │  R2999/yr   │         │
│  │  Save 17%   │  │  Save 17%   │         │
│  │             │  │             │         │
│  │  [Select]   │  │  [Select]   │         │
│  └─────────────┘  └─────────────┘         │
│                                             │
│  User clicks [Select Monthly]               │
└─────────────────────────────────────────────┘
```

### Step 3: Payment Processing
```
┌─────────────────────────────────────────────┐
│         Yoco Payment Widget                 │
│                                             │
│  💳 Enter Payment Details                   │
│  ┌───────────────────────────────────────┐ │
│  │ Card Number: 4242 4242 4242 4242     │ │
│  │ Expiry: 12/25                         │ │
│  │ CVV: 123                              │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Amount: R299.00                            │
│                                             │
│  [Pay Now] → Click                          │
│                                             │
│  ⏳ Processing payment...                   │
│                                             │
│  ✅ Payment Successful!                     │
│                                             │
│  Redirecting to success page...             │
└─────────────────────────────────────────────┘
```

### Step 4: Payment Success Page
```
┌─────────────────────────────────────────────┐
│                                             │
│              ✅                             │
│       Payment Successful!                   │
│                                             │
│  Thank you for your payment! Your           │
│  subscription has been activated and you    │
│  now have full access to all features.      │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │    [Start Learning]                   │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │    [Generate CV] 🔵                   │ │ ← NEW!
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │    [View Profile]                     │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  🎉 BEHIND THE SCENES:                      │
│  System automatically activated:            │
│  ✅ Payment record updated                  │
│  ✅ Subscription created                    │
│  ✅ 20 CV generations unlocked!            │
│  ✅ hasPaidSubscription: true              │
└─────────────────────────────────────────────┘
```

### Step 5: Back to CV Generator
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  User clicks [Generate CV] 🔵               │
│                                             │
│            ↓                                │
│     Navigate to /cv-generator               │
│                                             │
│  📊 NEW Status Banner:                      │
│  ┌───────────────────────────────────────┐ │
│  │ ⭐ Premium Subscriber                  │ │
│  │ Free: 0/3 | Paid: 20/20 ✨            │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ✅ Ready to generate 20 CVs!              │
└─────────────────────────────────────────────┘
```

---

## 4️⃣ USING PAID GENERATIONS

### First Paid Generation
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  📊 Status:                                 │
│  ⭐ Free: 0/3 | Paid: 20/20                │
│                                             │
│  [Generate CV] → Click                      │
│                                             │
│  ✅ CV Generated!                           │
│                                             │
│  System logic:                              │
│  • freeRemaining = 0                        │
│  • hasPaidSubscription = true               │
│  • Use paid generation ✅                   │
│  • paidGenerationsUsed: 1                   │
│                                             │
│  📊 Updated Status:                         │
│  ⭐ Free: 0/3 | Paid: 19/20                │
└─────────────────────────────────────────────┘
```

### After Several Generations
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  📊 Status:                                 │
│  ⭐ Free: 0/3 | Paid: 15/20                │
│                                             │
│  User has generated:                        │
│  • 3 free CVs                               │
│  • 5 paid CVs                               │
│  • Total: 8 CVs                             │
│  • Remaining: 15 paid CVs                   │
│                                             │
│  [Generate CV] → Still works! ✅            │
└─────────────────────────────────────────────┘
```

### Near Limit
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  📊 Status:                                 │
│  ⭐ Free: 0/3 | Paid: 2/20                 │
│                                             │
│  ⚠️  Only 2 generations remaining!         │
│                                             │
│  [Generate CV] → Click                      │
│                                             │
│  ✅ CV Generated!                           │
│                                             │
│  📊 Updated Status:                         │
│  ⭐ Free: 0/3 | Paid: 1/20                 │
│                                             │
│  ⚠️  Last generation remaining!            │
└─────────────────────────────────────────────┘
```

### All Paid Used - BLOCKED
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  📊 Status:                                 │
│  ⭐ Free: 0/3 | Paid: 0/20                 │
│                                             │
│  [Generate CV] → Click                      │
│                                             │
│  ❌ BLOCKED!                                │
│  ┌───────────────────────────────────────┐ │
│  │ ⚠️ Generation Limit Reached           │ │
│  │                                       │ │
│  │ You have reached your generation      │ │
│  │ limit. Please contact support for     │ │
│  │ more generations.                     │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  User has generated:                        │
│  • 3 free CVs ✅                            │
│  • 20 paid CVs ✅                           │
│  • Total: 23 CVs 🎉                         │
└─────────────────────────────────────────────┘
```

---

## 5️⃣ PERSISTENT SUBSCRIPTION

### User Logs Out
```
┌─────────────────────────────────────────────┐
│          Navigation Bar                     │
│                                             │
│  [Log Out] → Click                          │
│                                             │
│  ✅ User logged out                         │
│                                             │
│  📦 Data SAVED in Firestore:                │
│  ┌───────────────────────────────────────┐ │
│  │ cvGenerations/userId:                 │ │
│  │  {                                    │ │
│  │    freeGenerationsUsed: 3,            │ │
│  │    paidGenerationsUsed: 5,            │ │
│  │    hasPaidSubscription: true, ← SAVED│ │
│  │    totalGenerations: 8                │ │
│  │  }                                    │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### User Logs Back In
```
┌─────────────────────────────────────────────┐
│          Login Page                         │
│                                             │
│  [Log In] → Credentials entered             │
│                                             │
│  ✅ Login successful                        │
│                                             │
│  📦 Data LOADED from Firestore:             │
│  ┌───────────────────────────────────────┐ │
│  │ cvGenerations/userId:                 │ │
│  │  {                                    │ │
│  │    freeGenerationsUsed: 3,            │ │
│  │    paidGenerationsUsed: 5,            │ │
│  │    hasPaidSubscription: true, ← YES! │ │
│  │    totalGenerations: 8                │ │
│  │  }                                    │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Navigate to CV Generator:                  │
│  📊 Status:                                 │
│  ⭐ Free: 0/3 | Paid: 15/20                │
│                                             │
│  ✅ Subscription REMEMBERED!               │
│  ✅ Can still generate CVs!                │
└─────────────────────────────────────────────┘
```

---

## 6️⃣ EDITING DOESN'T COUNT

### Important Note
```
┌─────────────────────────────────────────────┐
│          CV Generator                       │
│                                             │
│  📊 Status:                                 │
│  ⭐ Free: 0/3 | Paid: 15/20                │
│                                             │
│  User has generated CV                      │
│                                             │
│  ✏️  Editing Options:                       │
│  ┌───────────────────────────────────────┐ │
│  │ [Edit] → Manual editing               │ │
│  │ ✅ FREE - Doesn't use generation      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ [AI Edit] → AI improvements           │ │
│  │ ✅ FREE - Doesn't use generation      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  User can edit unlimited times! 🎉          │
│  Generation count stays at: Paid: 15/20     │
└─────────────────────────────────────────────┘
```

---

## 7️⃣ FIRESTORE DATA STRUCTURE

### Free User Record
```
Firestore → cvGenerations → user123
┌─────────────────────────────────────────────┐
│  Document: user123                          │
│  ┌───────────────────────────────────────┐ │
│  │ userId: "user123"                     │ │
│  │ freeGenerationsUsed: 2                │ │
│  │ paidGenerationsUsed: 0                │ │
│  │ totalGenerations: 2                   │ │
│  │ hasPaidSubscription: false            │ │
│  │ createdAt: Oct 30, 2025 10:00 AM      │ │
│  │ lastGeneratedAt: Oct 30, 2025 11:30 AM│ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Interpretation:                            │
│  • Used 2 of 3 free generations             │
│  • Has 1 free generation left               │
│  • Not subscribed                           │
│  • Can generate 1 more CV                   │
└─────────────────────────────────────────────┘
```

### Subscribed User Record
```
Firestore → cvGenerations → user456
┌─────────────────────────────────────────────┐
│  Document: user456                          │
│  ┌───────────────────────────────────────┐ │
│  │ userId: "user456"                     │ │
│  │ freeGenerationsUsed: 3                │ │
│  │ paidGenerationsUsed: 7                │ │
│  │ totalGenerations: 10                  │ │
│  │ hasPaidSubscription: true ← KEY!     │ │
│  │ createdAt: Oct 29, 2025 3:00 PM       │ │
│  │ lastGeneratedAt: Oct 30, 2025 2:15 PM │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Interpretation:                            │
│  • Used all 3 free generations              │
│  • Used 7 of 20 paid generations            │
│  • Has 13 paid generations left             │
│  • Subscribed ✅                            │
│  • Can generate 13 more CVs                 │
└─────────────────────────────────────────────┘
```

---

## 🎯 COMPLETE SYSTEM FLOW DIAGRAM

```
┌─────────────┐
│  New User   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│ Firestore Record Created        │
│ hasPaidSubscription: false      │
│ 3 Free Generations Available    │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│ User Generates 3 CVs            │
│ freeGenerationsUsed: 3          │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│ ❌ BLOCKED - No More Free       │
│ Show "Subscribe Now" Button     │
└──────┬──────────────────────────┘
       │
       ↓ User Clicks Subscribe
       │
┌──────▼──────────────────────────┐
│ Navigate to /profile            │
│ Select Subscription Plan        │
└──────┬──────────────────────────┘
       │
       ↓
┌──────▼──────────────────────────┐
│ Complete Payment via Yoco       │
│ Payment Status: Successful      │
└──────┬──────────────────────────┘
       │
       ↓
┌──────▼──────────────────────────┐
│ Redirect to /payment-success    │
│ System Activates Subscription:  │
│  1. Update payment record       │
│  2. Create subscription record  │
│  3. Call activatePaidSub()      │
└──────┬──────────────────────────┘
       │
       ↓
┌──────▼──────────────────────────┐
│ Firestore Updated:              │
│ hasPaidSubscription: true ✅   │
│ paidGenerationsUsed: 0 (reset)  │
│ 20 Generations Unlocked! 🎉     │
└──────┬──────────────────────────┘
       │
       ↓
┌──────▼──────────────────────────┐
│ User Clicks "Generate CV"       │
│ Navigate to /cv-generator       │
└──────┬──────────────────────────┘
       │
       ↓
┌──────▼──────────────────────────┐
│ ✅ Can Generate CVs             │
│ Status: Paid: 20/20             │
│ Generate CVs → Uses Paid Limit  │
└──────┬──────────────────────────┘
       │
       ↓ User Logs Out
       │
┌──────▼──────────────────────────┐
│ Data PERSISTED in Firestore     │
│ hasPaidSubscription: true       │
└──────┬──────────────────────────┘
       │
       ↓ User Logs Back In
       │
┌──────▼──────────────────────────┐
│ ✅ Subscription REMEMBERED      │
│ Can Still Generate CVs!          │
│ System Remembers Everything! 🎉  │
└─────────────────────────────────┘
```

---

## 🎉 SUMMARY: WHAT HAPPENS WHEN USER SUBSCRIBES

### Automatic Actions
```
Payment Successful
       ↓
┌─────────────────────────────────────────────┐
│ 1. Payment Record Updated                   │
│    status: "completed" ✅                   │
│    paidAt: timestamp                        │
│    expiresAt: +1 month or +1 year           │
└─────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────┐
│ 2. Subscription Record Created              │
│    userId: user.id                          │
│    status: "active" ✅                      │
│    subscriptionType: "monthly" or "yearly"  │
│    startDate: now                           │
│    endDate: expiresAt                       │
│    autoRenew: true                          │
└─────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────┐
│ 3. CV Generation Subscription Activated     │
│    hasPaidSubscription: true ✅             │
│    paidGenerationsUsed: 0 (reset)           │
│    → 20 generations unlocked! 🎉            │
└─────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────┐
│ 4. User Notified                            │
│    Toast: "Payment Successful!"             │
│    "Your subscription is now active with    │
│     20 CV generations! Welcome aboard!"     │
└─────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────┐
│ 5. User Can Immediately Use                 │
│    Button: [Generate CV] 🔵                 │
│    → Navigate to CV Generator               │
│    → Start generating CVs right away!       │
└─────────────────────────────────────────────┘
```

---

**Visual Guide Status**: ✅ Complete
**System Status**: ✅ Production Ready
**User Experience**: ⭐⭐⭐⭐⭐
**Impact**: 🚀 Full subscription tracking!

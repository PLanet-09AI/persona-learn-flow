# CV Generation Subscription System

## 🎯 Overview

The CV Generation Subscription System tracks user CV generations and manages subscription tiers with the following limits:
- **Free Tier**: 3 CV generations
- **Paid Subscription**: 20 additional CV generations (23 total)

## 📊 System Architecture

### Collections

#### 1. `cvGenerations/{userId}`
Tracks CV generation usage per user.

**Schema:**
```typescript
{
  userId: string;                    // User ID (document ID)
  freeGenerationsUsed: number;       // Free generations used (0-3)
  paidGenerationsUsed: number;       // Paid generations used (0-20)
  totalGenerations: number;          // Total generations used
  hasPaidSubscription: boolean;      // Subscription status
  createdAt: Timestamp;              // Record creation date
  lastGeneratedAt: Timestamp | null; // Last generation date
}
```

**Example:**
```javascript
{
  userId: "abc123xyz",
  freeGenerationsUsed: 3,
  paidGenerationsUsed: 5,
  totalGenerations: 8,
  hasPaidSubscription: true,
  createdAt: Timestamp,
  lastGeneratedAt: Timestamp
}
```

#### 2. `subscriptions/{subscriptionId}`
Tracks active subscriptions.

**Schema:**
```typescript
{
  userId: string;
  paymentId: string;
  subscriptionType: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. `payments/{paymentId}`
Records all payment transactions.

**Schema:**
```typescript
{
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  subscriptionType: 'monthly' | 'yearly';
  checkoutId: string;
  paymentId?: string;
  createdAt: Date;
  paidAt?: Date;
  expiresAt?: Date;
}
```

---

## 🔄 User Flow

### 1. **New User (Free Tier)**

```
User Signs Up
     ↓
CV Generation Record Created
     ↓
freeGenerationsUsed: 0
paidGenerationsUsed: 0
hasPaidSubscription: false
     ↓
User Can Generate 3 CVs
```

### 2. **Using Free Generations**

```
User Generates CV #1
     ↓
freeGenerationsUsed: 1
Remaining: 2 free
     ↓
User Generates CV #2
     ↓
freeGenerationsUsed: 2
Remaining: 1 free
     ↓
User Generates CV #3
     ↓
freeGenerationsUsed: 3
Remaining: 0 free
     ↓
❌ BLOCKED - Subscribe Required
```

### 3. **Subscription Process**

```
User Clicks "Subscribe Now"
     ↓
Navigates to /profile
     ↓
Selects Subscription Plan
     ↓
Completes Payment
     ↓
Payment Success Page
     ↓
System Activates Subscription:
  1. Updates payment record
  2. Creates subscription record
  3. Calls cvGenerationTracker.activatePaidSubscription()
     ↓
hasPaidSubscription: true
paidGenerationsUsed: 0 (reset)
     ↓
✅ 20 New Generations Unlocked!
```

### 4. **Post-Subscription Usage**

```
Subscribed User Generates CV
     ↓
System Checks:
  - Free remaining? Use free
  - No free? Use paid
     ↓
All 3 free used → Uses paid generation
     ↓
paidGenerationsUsed: 1
Remaining: 19 paid
     ↓
User Can Generate 19 More CVs
```

---

## 💻 Code Implementation

### Service Methods

#### `cvGenerationTracker.canGenerateCV(userId)`
Checks if user can generate a CV.

**Returns:**
```typescript
{
  canGenerate: boolean;
  reason?: string;
  remainingFree: number;
  remainingPaid: number;
  totalRemaining: number;
}
```

**Example:**
```javascript
// Free user with 1 generation left
{
  canGenerate: true,
  remainingFree: 1,
  remainingPaid: 0,
  totalRemaining: 1
}

// Subscribed user with all generations used
{
  canGenerate: false,
  reason: "You have reached your generation limit...",
  remainingFree: 0,
  remainingPaid: 0,
  totalRemaining: 0
}
```

#### `cvGenerationTracker.recordGeneration(userId)`
Records a CV generation.

**Logic:**
```javascript
if (freeRemaining > 0) {
  // Use free generation
  freeGenerationsUsed++;
} else if (hasPaidSubscription) {
  // Use paid generation
  paidGenerationsUsed++;
} else {
  // No generations left
  throw new Error('No generations remaining');
}
```

#### `cvGenerationTracker.activatePaidSubscription(userId)`
Activates paid subscription after successful payment.

**Actions:**
1. Sets `hasPaidSubscription: true`
2. Resets `paidGenerationsUsed: 0`
3. Unlocks 20 paid generations

**Called from:**
- `PaymentSuccess` component after payment confirmation

#### `cvGenerationTracker.getStatistics(userId)`
Gets user's generation statistics.

**Returns:**
```typescript
{
  freeUsed: number;
  freeRemaining: number;
  paidUsed: number;
  paidRemaining: number;
  totalUsed: number;
  totalRemaining: number;
  hasPaid: boolean;
}
```

---

## 🎨 UI Components

### Generation Counter Badge

**Free User:**
```
┌─────────────────────────────────────┐
│ 💎 Free Tier                        │
│ 2/3 free generations remaining      │
└─────────────────────────────────────┘
```

**Free User (Exhausted):**
```
┌─────────────────────────────────────────────┐
│ 💎 Free Tier                                │
│ 0/3 free generations remaining              │
│ Subscribe to unlock 20 more generations!    │
│                        [Subscribe Now] 🔵   │
└─────────────────────────────────────────────┘
```

**Paid User:**
```
┌─────────────────────────────────────┐
│ ⭐ Premium Subscriber                │
│ Free: 0/3 | Paid: 15/20             │
└─────────────────────────────────────┘
```

### Subscribe Now Button

**Location:** CV Generator page
**Trigger:** When `freeRemaining === 0`
**Action:** Navigate to `/profile`

```tsx
<Button 
  size="sm" 
  onClick={() => window.location.href = '/profile'}
  className="ml-4 bg-blue-600 hover:bg-blue-700"
>
  <CreditCard className="h-4 w-4 mr-2" />
  Subscribe Now
</Button>
```

### Payment Success Buttons

**Location:** Payment success page (`/payment-success`)
**Options:**
1. **Start Learning** - Navigate to `/learn`
2. **Generate CV** 🆕 - Navigate to `/cv-generator` (Blue button)
3. **View Profile** - Navigate to `/profile`

```tsx
<Button onClick={() => navigate('/cv-generator')}
  className="w-full bg-blue-600 hover:bg-blue-700">
  Generate CV
</Button>
```

---

## 🔒 Firebase Security Rules

### cvGenerations Collection

```javascript
match /cvGenerations/{userId} {
  allow read: if isUserOwned(userId) || isAdmin();
  allow create: if isAuthenticated() && userId == request.auth.uid;
  allow update: if isUserOwned(userId) || isAdmin();
  allow delete: if isAdmin();
}
```

**Rules:**
- ✅ Users can read their own CV generation records
- ✅ Users can create their own records
- ✅ Users can update their own records (for generation tracking)
- ✅ Admins can do everything
- ❌ Users cannot access other users' records

### Subscriptions Collection

```javascript
match /subscriptions/{subscriptionId} {
  allow read: if isUserOwned(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if isUserOwned(resource.data.userId) || isAdmin();
  allow delete: if isAdmin();
}
```

### Payments Collection

```javascript
match /payments/{paymentId} {
  allow read: if isUserOwned(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if isUserOwned(resource.data.userId) || isAdmin();
  allow delete: if isAdmin();
}
```

---

## 📈 Generation Limits

### Free Tier
| Feature | Limit |
|---------|-------|
| CV Generations | 3 |
| CV Editing | ✅ Unlimited |
| AI Editing | ✅ Unlimited |
| PDF Export | ✅ Unlimited |
| Cover Letter | ✅ Included |

### Paid Subscription
| Feature | Limit |
|---------|-------|
| CV Generations | 20 additional (23 total) |
| CV Editing | ✅ Unlimited |
| AI Editing | ✅ Unlimited |
| PDF Export | ✅ Unlimited |
| Cover Letter | ✅ Included |
| Priority Support | ✅ Yes |

---

## 🔄 Subscription Lifecycle

### Payment Success Flow

```javascript
// 1. Payment completed via Yoco
// 2. User redirected to /payment-success?checkout_id=xxx

// 3. PaymentSuccess component processes:
const payment = await paymentFirebaseService.getPaymentByCheckoutId(checkoutId);

// 4. Update payment record
await paymentFirebaseService.updatePaymentRecord(payment.id, {
  status: 'completed',
  paymentId: paymentId,
  paidAt: now,
  expiresAt: expiresAt
});

// 5. Create subscription record
await paymentFirebaseService.createSubscription({
  userId: user.id,
  paymentId: payment.id,
  subscriptionType: payment.subscriptionType,
  status: 'active',
  startDate: now,
  endDate: expiresAt,
  autoRenew: true
});

// 6. Activate CV generation subscription ✨
await cvGenerationTracker.activatePaidSubscription(user.id);
// → Sets hasPaidSubscription: true
// → Resets paidGenerationsUsed: 0
// → Unlocks 20 generations

// 7. Show success toast
toast({
  title: "Payment Successful!",
  description: "Your subscription is now active with 20 CV generations!"
});
```

### Generation Flow

```javascript
// Before generating CV
const eligibility = await cvGenerationTracker.canGenerateCV(user.id);

if (!eligibility.canGenerate) {
  // Show error message
  toast({
    title: "Generation Limit Reached",
    description: eligibility.reason,
    variant: "destructive"
  });
  return;
}

// Generate CV
const cv = await cvGeneratorService.generateCV(profile, format);

// Record generation
await cvGenerationTracker.recordGeneration(user.id);

// Update UI stats
const stats = await cvGenerationTracker.getStatistics(user.id);
setGenerationStats(stats);
```

---

## 🧪 Testing Scenarios

### Scenario 1: New Free User
1. Sign up new account
2. Navigate to CV Generator
3. Check banner: "3/3 free generations remaining"
4. Generate CV #1 → Success
5. Check banner: "2/3 free generations remaining"
6. Generate CV #2 → Success
7. Check banner: "1/3 free generations remaining"
8. Generate CV #3 → Success
9. Check banner: "0/3 free generations remaining"
10. See "Subscribe Now" button
11. Try to generate → Blocked with error message

### Scenario 2: Subscription Purchase
1. Free user with 0 generations left
2. Click "Subscribe Now"
3. Navigate to /profile
4. Select subscription plan
5. Complete payment
6. Redirected to /payment-success
7. System activates subscription
8. Click "Generate CV" button
9. Navigate to CV Generator
10. Check banner: Shows paid subscription status
11. Generate CV → Success using paid generation
12. Check stats: paidUsed: 1, paidRemaining: 19

### Scenario 3: Paid User Usage
1. Subscribed user logs in
2. Navigate to CV Generator
3. Check banner: "Free: 0/3 | Paid: 5/20" (example)
4. Generate CV → Uses paid generation
5. Check stats: paidUsed: 6, paidRemaining: 14
6. Continue generating until 20 paid used
7. Try to generate 21st → Blocked
8. Message: "You have reached your generation limit"

### Scenario 4: Subscription Expiry
1. Subscription ends (endDate passed)
2. System marks subscription as 'expired'
3. hasPaidSubscription remains true (for historical tracking)
4. User cannot use paid generations anymore
5. User needs to renew subscription

---

## 🐛 Error Handling

### No Generations Remaining
```javascript
{
  canGenerate: false,
  reason: "You have used all 3 free CV generations. Subscribe to unlock 20 more generations!",
  remainingFree: 0,
  remainingPaid: 0,
  totalRemaining: 0
}
```

### Subscription Limit Reached
```javascript
{
  canGenerate: false,
  reason: "You have reached your generation limit. Please contact support for more generations.",
  remainingFree: 0,
  remainingPaid: 0,
  totalRemaining: 0
}
```

### Firestore Errors
```javascript
try {
  await cvGenerationTracker.recordGeneration(userId);
} catch (error) {
  console.error('❌ Error recording generation:', error);
  toast({
    title: "Error",
    description: "Failed to record generation. Please try again.",
    variant: "destructive"
  });
}
```

---

## 📊 Admin Monitoring

### Firebase Console Queries

**Check user's generation status:**
```javascript
// Navigate to Firestore
// Collection: cvGenerations
// Document: {userId}
// View: freeGenerationsUsed, paidGenerationsUsed, hasPaidSubscription
```

**Find users who subscribed:**
```javascript
// Collection: cvGenerations
// Where: hasPaidSubscription == true
```

**Find users who exhausted free tier:**
```javascript
// Collection: cvGenerations
// Where: freeGenerationsUsed == 3
// Where: hasPaidSubscription == false
```

### Logs to Monitor
```javascript
console.log('📊 Fetching CV generation record for user:', userId);
console.log('✅ Generation record found:', data);
console.log('🔍 Checking if user can generate CV:', userId);
console.log('📊 Generation limits:', { freeUsed, remainingFree, paidUsed, remainingPaid });
console.log('📝 Recording CV generation for user:', userId);
console.log('✅ Free generation recorded');
console.log('✅ Paid generation recorded');
console.log('💳 Activating paid subscription for user:', userId);
console.log('✅ Paid subscription activated - 20 generations unlocked');
```

---

## 🚀 Deployment Checklist

- [x] `cvGenerationTracker` service implemented
- [x] Firebase rules for `cvGenerations` collection
- [x] Firebase rules for `subscriptions` collection
- [x] Firebase rules for `payments` collection
- [x] `PaymentSuccess` component activates subscription
- [x] CV Generator checks generation limits
- [x] Subscribe Now button navigates to profile
- [x] Payment success page has "Generate CV" button
- [x] Generation counter UI displays correct stats
- [x] Error messages for limit reached
- [x] Toast notifications for subscription activation
- [x] Logging for debugging and monitoring

---

## 📝 Next Steps

### Future Enhancements
1. **Subscription Renewal Notifications**
   - Email users before subscription expires
   - Auto-renewal functionality

2. **Generation Analytics**
   - Track which formats users prefer
   - Track average generation time
   - Track AI edit usage

3. **Flexible Limits**
   - Admin can adjust limits per user
   - Bulk generation packages
   - Enterprise plans

4. **Usage Dashboard**
   - User can view generation history
   - Download past CVs
   - Track subscription usage

---

**Status**: ✅ Complete and Production Ready
**Last Updated**: October 30, 2025
**Version**: 1.0.0

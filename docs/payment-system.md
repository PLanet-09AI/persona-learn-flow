# Payment & Refund System Documentation

## Overview

The Persona Learn Flow application now includes a comprehensive payment and refund management system using Yoco payments, with both client-side and server-side integration options.

## Components

### 1. Enhanced Yoco Service (`src/services/yocoEnhanced.ts`)
- **Purpose**: Comprehensive Yoco API integration with both client-side and server-side capabilities
- **Features**:
  - Checkout creation using secret key
  - Refund processing with metadata
  - Payment method selection (popup vs checkout page)
  - Configuration validation
  - Error handling

### 2. Refund Manager (`src/components/payment/RefundManager.tsx`)
- **Purpose**: Administrative interface for processing refunds
- **Features**:
  - Payment ID lookup
  - Refund amount specification
  - Refund reason tracking
  - Real-time refund processing
  - Test mode for development

### 3. Admin Payment Panel (`src/components/admin/AdminPaymentPanel.tsx`)
- **Purpose**: Complete payment administration dashboard
- **Features**:
  - Payment overview with statistics
  - Payment history with search
  - Direct refund initiation
  - Real-time data loading

### 4. Admin Page (`src/pages/AdminPage.tsx`)
- **Purpose**: Protected admin interface
- **Features**:
  - Role-based access control
  - Multi-section navigation
  - User authentication validation

### 5. Updated Subscription Plans (`src/components/payment/SubscriptionPlans.tsx`)
- **Purpose**: User subscription purchase interface
- **Features**:
  - Payment method selection toggle
  - Popup payments (client-side)
  - Checkout page redirects (server-side)
  - Real-time payment processing

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Yoco API Keys
VITE_YOCO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxx
VITE_YOCO_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx

# For production, use live keys:
# VITE_YOCO_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxx
# VITE_YOCO_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
```

### Security Notes
- Secret keys are used only for server-side operations (checkout creation, refunds)
- Public keys are used for client-side popup payments
- All sensitive operations require proper authentication

## Usage

### For Customers

#### Subscription Purchase
1. Navigate to `/subscription`
2. Choose payment method (popup or checkout page)
3. Select subscription plan
4. Complete payment process
5. Receive confirmation and access

#### Payment Methods
- **Popup Payment**: Instant payment without leaving the page (uses public key)
- **Checkout Page**: Redirects to Yoco secure checkout (uses secret key)

### For Administrators

#### Access Admin Panel
1. Log in with admin credentials (email containing "admin" or "admin@example.com")
2. Navigate to `/admin-panel`
3. View payment statistics and history
4. Process refunds as needed

#### Process Refunds
1. Go to "Process Refunds" tab in admin panel
2. Enter payment ID and refund amount
3. Add reason (optional)
4. Click "Process Real Refund" for live refunds
5. Use "Test Refund" for development/testing

#### Payment Management
- View payment statistics and success rates
- Search payments by ID, email, or subscription type
- Access detailed payment information
- Initiate refunds directly from payment history

## API Integration

### Yoco Checkout Creation
```typescript
const checkout = await enhancedYocoService.createCheckout({
  amount: amountInCents,
  currency: 'ZAR',
  cancelUrl: `${window.location.origin}/payment-failure`,
  successUrl: `${window.location.origin}/payment-success`,
  metadata: {
    userId: user.uid,
    subscriptionType: 'Monthly Pro'
  }
});
```

### Refund Processing
```typescript
const refund = await enhancedYocoService.processRefund(paymentId, {
  amount: amountInCents,
  reason: 'Customer request',
  metadata: {
    processedBy: 'admin',
    processedAt: new Date().toISOString()
  }
});
```

### Payment Method Selection
```typescript
// Popup payment (client-side)
const result = await yocoClient.initiateSubscriptionPayment(subscriptionPlan, user);

// Checkout page (server-side)
const result = await enhancedYocoService.initiateSubscriptionPayment(subscriptionPlan, user, 'checkout');
```

## Development vs Production

### Development Mode
- Uses test API keys (`pk_test_*`, `sk_test_*`)
- Test refunds available without secret key
- Mock data for payment history
- Safe for testing all features

### Production Mode
- Requires live API keys (`pk_live_*`, `sk_live_*`)
- Real payment processing
- Actual refunds with money movement
- Live customer data

## Error Handling

### Common Errors
- **CORS Issues**: Resolved by using client-side SDK for popup payments
- **Missing Secret Key**: Gracefully handled with test mode fallback
- **Invalid Payment ID**: Clear error messages for refund attempts
- **Insufficient Funds**: Proper error handling for refund amount validation

### Error Recovery
- Automatic retry mechanisms for network issues
- Clear user feedback for all error states
- Fallback options when services are unavailable
- Comprehensive logging for debugging

## Routes

- `/subscription` - Customer subscription plans
- `/payment-success` - Successful payment confirmation
- `/payment-failure` - Failed payment handling
- `/admin-panel` - Administrative payment management (protected)

## Future Enhancements

1. **User Management**: Admin panel for user account management
2. **Payment Analytics**: Advanced reporting and analytics
3. **Automated Refunds**: Rule-based automatic refund processing
4. **Email Notifications**: Payment and refund confirmations
5. **Webhook Integration**: Real-time payment status updates
6. **Multi-currency Support**: Support for additional currencies
7. **Subscription Management**: Advanced subscription lifecycle management

## Testing

### Test Payment Cards (Yoco Test Mode)
- **Successful Payment**: 4242 4242 4242 4242
- **Failed Payment**: 4000 0000 0000 0002
- **Authentication Required**: 4000 0025 0000 3155

### Test Scenarios
1. Successful subscription purchase (popup method)
2. Successful subscription purchase (checkout method)
3. Failed payment handling
4. Full refund processing
5. Partial refund processing
6. Admin access control
7. Payment search and filtering

## Security Considerations

1. **API Key Management**: Store secret keys securely, never expose in client code
2. **Access Control**: Implement proper role-based authentication
3. **Input Validation**: Validate all payment amounts and IDs
4. **Audit Trail**: Log all administrative actions
5. **HTTPS Only**: All payment processing requires secure connections
6. **PCI Compliance**: Follow Yoco's PCI compliance guidelines

This payment system provides a complete solution for subscription management with comprehensive administrative controls and user-friendly payment options.

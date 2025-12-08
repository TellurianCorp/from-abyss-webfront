# Stripe Integration Documentation

## Overview

The Stripe integration extends the financial module with comprehensive payment processing capabilities, allowing you to manage products, customers, payments, and subscriptions directly from the dashboard.

## Features

### 🏪 Product Management
- Create and manage Stripe products
- Set up pricing tiers (one-time and recurring)
- Track product performance and sales

### 👥 Customer Management
- View and manage Stripe customers
- Track customer subscription history
- Monitor customer payment patterns

### 💳 Payment Processing
- Track payment intents and their status
- Monitor successful and failed payments
- View payment history with detailed information

### 🔄 Subscription Management
- Manage recurring subscriptions
- Track subscription status and billing cycles
- Monitor subscription revenue

### 📊 Financial Integration
- Automatic creation of financial transactions from Stripe payments
- Stripe fee calculation and tracking
- Revenue reporting and analytics

## Setup

### 1. Install Dependencies

The Stripe integration requires the `stripe` Python package:

```bash
pip install stripe==10.0.0
```

### 2. Database Migration

Run the migration to create Stripe-related tables:

```bash
python manage.py migrate financial
```

### 3. Configure Stripe Credentials

1. Go to Django Admin → Financial → Stripe Credentials
2. Create a new Stripe credential with:
   - **Name**: Friendly name for your Stripe account
   - **Publishable Key**: Your Stripe publishable key (pk_test_... or pk_live_...)
   - **Secret Key**: Your Stripe secret key (sk_test_... or sk_live_...)
   - **Webhook Secret**: Your webhook endpoint secret (optional)
   - **Live Mode**: Check if using live keys, uncheck for test mode
   - **Active**: Check to make this the active credential

### 4. Create Sample Data (Optional)

For testing purposes, you can create sample Stripe data:

```bash
python manage.py create_stripe_sample_data --clear
```

## Usage

### Accessing Stripe Integration

1. Navigate to **Publisher → Financial Dashboard**
2. Click the **"Stripe Integration"** button
3. You'll see the Stripe dashboard with overview statistics

### Stripe Dashboard

The main Stripe dashboard provides:

- **Overview Cards**: Products, customers, payments, and subscriptions count
- **Revenue Display**: Total revenue from Stripe payments
- **Recent Activity**: Latest payments and subscriptions
- **Quick Actions**: Direct links to manage different aspects

### Managing Products

1. Go to **Stripe → Products**
2. View all your Stripe products and their pricing
3. Use the **"Sync Products"** button to fetch latest data from Stripe

### Managing Customers

1. Go to **Stripe → Customers**
2. View all your Stripe customers
3. See customer details, subscription counts, and contact information

### Viewing Payments

1. Go to **Stripe → Payments**
2. View all payment intents with their status
3. Filter by status, customer, or date range

### Managing Subscriptions

1. Go to **Stripe → Subscriptions**
2. View all active and inactive subscriptions
3. Monitor billing cycles and subscription status

## API Integration

### StripeService Class

The `StripeService` class provides methods to interact with the Stripe API:

```python
from financial.stripe_services import StripeService

# Initialize service
stripe_service = StripeService()

# Create a product
product = stripe_service.create_product(
    name="My Product",
    description="Product description"
)

# Create a price
price = stripe_service.create_price(
    product=product,
    amount=Decimal('29.99'),
    recurring=True,
    interval='month'
)

# Create a customer
customer = stripe_service.create_customer(
    email="customer@example.com",
    name="John Doe"
)

# Create a payment intent
payment_intent = stripe_service.create_payment_intent(
    customer=customer,
    amount=Decimal('29.99'),
    description="Monthly subscription"
)
```

### Webhook Handling

The integration includes webhook handling for real-time updates:

```python
# Webhook endpoint: /studio/financial/stripe/webhook/
# Handles events like:
# - payment_intent.succeeded
# - customer.subscription.created
# - customer.subscription.updated
# - customer.subscription.deleted
```

## Data Models

### Core Models

- **StripeCredential**: API credentials and configuration
- **StripeProduct**: Products available for purchase
- **StripePrice**: Pricing for products (one-time or recurring)
- **StripeCustomer**: Customer information
- **StripePaymentIntent**: Payment processing records
- **StripeSubscription**: Recurring subscription records
- **StripeWebhookEvent**: Webhook event tracking
- **StripeTransaction**: Links Stripe payments to financial transactions

### Relationships

```
StripeProduct (1) → (many) StripePrice
StripeCustomer (1) → (many) StripePaymentIntent
StripeCustomer (1) → (many) StripeSubscription
StripePrice (1) → (many) StripeSubscription
StripePaymentIntent (1) → (1) StripeTransaction
Transaction (1) → (1) StripeTransaction
```

## Financial Integration

### Automatic Transaction Creation

When a Stripe payment succeeds, the system automatically:

1. Creates a financial transaction record
2. Calculates Stripe fees (2.9% + 30¢)
3. Records the net amount after fees
4. Links the Stripe payment to the financial transaction

### Fee Calculation

Stripe fees are calculated as:
- **Processing Fee**: 2.9% of the payment amount
- **Fixed Fee**: $0.30 per transaction
- **Total Fee**: Processing Fee + Fixed Fee

## Management Commands

### Sync Stripe Data

```bash
python manage.py sync_stripe
```

Syncs all data from your Stripe account to the local database.

Options:
- `--credential-id ID`: Use specific credential
- `--force`: Continue even without active credential

### Create Sample Data

```bash
python manage.py create_stripe_sample_data
```

Creates sample products, customers, and pricing for testing.

Options:
- `--clear`: Clear existing data before creating sample data

## Security Considerations

### API Key Management

- Store Stripe keys securely in the database
- Use environment variables for production
- Rotate keys regularly
- Never commit keys to version control

### Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement proper error handling
- Log webhook events for debugging

### Data Privacy

- Encrypt sensitive customer data
- Comply with PCI DSS requirements
- Implement proper access controls
- Regular security audits

## Troubleshooting

### Common Issues

1. **"No active Stripe credential found"**
   - Create a Stripe credential in Django Admin
   - Mark it as active

2. **"Stripe API error"**
   - Check your API keys
   - Verify network connectivity
   - Check Stripe account status

3. **Webhook not working**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Review webhook event logs

### Debug Mode

Enable debug logging for Stripe operations:

```python
import logging
logging.getLogger('financial.stripe_services').setLevel(logging.DEBUG)
```

## Best Practices

### Product Management
- Use descriptive product names
- Set up clear pricing tiers
- Test products in test mode first

### Customer Experience
- Provide clear billing information
- Send payment confirmations
- Handle failed payments gracefully

### Data Management
- Regular data synchronization
- Monitor webhook events
- Keep audit logs

### Performance
- Use pagination for large datasets
- Cache frequently accessed data
- Optimize database queries

## Support

For issues with the Stripe integration:

1. Check the Django logs for errors
2. Verify Stripe account configuration
3. Test with sample data first
4. Review webhook event logs

## API Reference

### StripeService Methods

- `create_product(name, description, metadata)`
- `get_products()`
- `create_price(product, amount, currency, recurring, interval)`
- `get_prices(product=None)`
- `create_customer(email, name, phone, description, metadata)`
- `get_customers()`
- `create_payment_intent(customer, amount, currency, description, metadata)`
- `get_payment_intents(customer=None)`
- `create_subscription(customer, price, metadata)`
- `get_subscriptions(customer=None)`
- `handle_webhook(payload, signature)`

### URL Patterns

- `/studio/financial/stripe/` - Stripe dashboard
- `/studio/financial/stripe/products/` - Products list
- `/studio/financial/stripe/customers/` - Customers list
- `/studio/financial/stripe/payments/` - Payments list
- `/studio/financial/stripe/subscriptions/` - Subscriptions list
- `/studio/financial/stripe/sync/` - Sync data
- `/studio/financial/stripe/webhook/` - Webhook endpoint

# Manual Patreon Tier Management

## 🚨 Important Notice

**Tier management is NOT available in Patreon API v2.** According to the [official Patreon API documentation](https://docs.patreon.com/#api-endpoints), the current API v2 only supports these endpoints:

- `GET /api/oauth2/v2/identity`
- `GET /api/oauth2/v2/campaigns`
- `GET /api/oauth2/v2/campaigns/{campaign_id}`
- `GET /api/oauth2/v2/campaigns/{campaign_id}/members`
- `GET /api/oauth2/v2/members/{id}`
- `GET /api/oauth2/v2/campaigns/{campaign_id}/posts`
- `GET /api/oauth2/v2/posts/{id}`

**No tier endpoints are available in the current API.**

## 🎯 How to Manage Tiers

### 1. **Via Patreon Web Interface (Recommended)**

1. Go to [Patreon Dashboard](https://www.patreon.com/dashboard/overview)
2. Navigate to your campaign
3. Click on "Tiers" in the left sidebar
4. Create, edit, or delete tiers as needed

### 2. **Via Django Admin (Local Management)**

You can manage tiers locally in your database:

```bash
# Start the Django admin
python manage.py runserver 0.0.0.0:8000

# Visit: http://localhost:8000/admin/patreon/patreontier/
```

### 3. **Via Django Shell (Programmatic)**

```python
from patreon.models import PatreonCredential, PatreonCampaign, PatreonTier

# Get your campaign
credential = PatreonCredential.get_active_credential()
campaign = PatreonCampaign.objects.get(campaign_id='10385073')

# Create tiers manually
tier1 = PatreonTier.objects.create(
    campaign=campaign,
    tier_id='supporter',
    title='Supporter',
    description='Support FromAbyss Media and get exclusive content',
    amount_cents=500,  # $5.00
    patron_count=0,
    post_count=0
)

tier2 = PatreonTier.objects.create(
    campaign=campaign,
    tier_id='patron',
    title='Patron',
    description='Premium supporter with extra benefits',
    amount_cents=1000,  # $10.00
    patron_count=0,
    post_count=0
)
```

## 📋 Available Tier Management Features

### ✅ **What Works:**

1. **Local Tier Storage**: Store tier information in your database
2. **Tier Display**: Show tiers in your web interface
3. **Tier Statistics**: Track patron counts and post counts
4. **Tier Relationships**: Link tiers to campaigns, members, and posts
5. **Django Admin**: Full CRUD operations via Django admin

### ❌ **What Doesn't Work:**

1. **API Tier Creation**: Cannot create tiers via API
2. **API Tier Updates**: Cannot update tiers via API
3. **API Tier Deletion**: Cannot delete tiers via API
4. **API Tier Fetching**: Cannot fetch tiers from Patreon API

## 🔄 **Workflow for Tier Management**

### **Step 1: Create Tiers on Patreon**
1. Go to [Patreon Dashboard](https://www.patreon.com/dashboard/overview)
2. Create your tiers with desired pricing and benefits
3. Note down the tier IDs and details

### **Step 2: Sync to Local Database**
```bash
# Create tiers locally to match your Patreon tiers
python manage.py shell
```

```python
from patreon.models import PatreonCredential, PatreonCampaign, PatreonTier

# Get your campaign
credential = PatreonCredential.get_active_credential()
campaign = PatreonCampaign.objects.get(campaign_id='10385073')

# Create tiers that match your Patreon tiers
tiers_data = [
    {
        'tier_id': 'supporter',
        'title': 'Supporter',
        'description': 'Support FromAbyss Media and get exclusive content',
        'amount_cents': 500,
    },
    {
        'tier_id': 'patron',
        'title': 'Patron',
        'description': 'Premium supporter with extra benefits',
        'amount_cents': 1000,
    },
    # Add more tiers as needed
]

for tier_data in tiers_data:
    PatreonTier.objects.get_or_create(
        tier_id=tier_data['tier_id'],
        campaign=campaign,
        defaults={
            'title': tier_data['title'],
            'description': tier_data['description'],
            'amount_cents': tier_data['amount_cents'],
            'patron_count': 0,
            'post_count': 0,
        }
    )
```

### **Step 3: Use Local Tier Management**
```bash
# List tiers
python manage.py manage_patreon_tiers --action=list --campaign-id=10385073

# View tiers in web interface
# Visit: http://localhost:8000/patreon/tiers/
```

## 🎯 **Recommended Approach**

1. **Create tiers manually** on Patreon web interface
2. **Sync tier information** to your local database
3. **Use local tier management** for display and tracking
4. **Update manually** when you make changes on Patreon

## 📚 **Additional Resources**

- [Patreon API Documentation](https://docs.patreon.com/#api-endpoints)
- [Patreon Dashboard](https://www.patreon.com/dashboard/overview)
- [Patreon Developer Forum](https://patreondevelopers.com)

## 🔧 **Future Considerations**

If Patreon adds tier endpoints to their API in the future, the integration is already set up to support them. The current methods will automatically work once the endpoints become available.

---

**Note**: This limitation is on Patreon's side, not with your integration. Your tier management system is fully functional for local operations and will work perfectly once Patreon provides tier endpoints in their API.

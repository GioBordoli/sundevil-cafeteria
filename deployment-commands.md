# 🚀 Sundevil Cafeteria Deployment Commands

This file contains all the commands needed to deploy the Sundevil Cafeteria system to Google Cloud Platform.

## 📋 Prerequisites

1. Google Cloud SDK installed
2. Authenticated with your Google account: `gcloud auth login`
3. Project set: `gcloud config set project sundevil-cafeteria`
4. Service account key uploaded as `gcloud-key.json`

## 🔧 Initial Setup Commands

### 1. Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable storage-component.googleapis.com
```

### 2. Create Cloud SQL Instance
```bash
# Create PostgreSQL instance
gcloud sql instances create sundevil-cafeteria-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=your-secure-database-password

# Create database
gcloud sql databases create sundevil_cafeteria \
    --instance=sundevil-cafeteria-db

# Set up database user (if needed)
gcloud sql users create appuser \
    --instance=sundevil-cafeteria-db \
    --password=your-app-user-password
```

### 3. Create Storage Buckets
```bash
# Create bucket for menu item images
gsutil mb gs://sundevil-cafeteria-images

# Make bucket publicly readable (for image access)
gsutil iam ch allUsers:objectViewer gs://sundevil-cafeteria-images

# Set CORS policy for web uploads
echo '[{"origin": ["*"], "method": ["GET", "POST", "PUT", "DELETE"], "responseHeader": ["*"], "maxAgeSeconds": 3600}]' > cors.json
gsutil cors set cors.json gs://sundevil-cafeteria-images
rm cors.json

# Optional: Create bucket for frontend assets
gsutil mb gs://sundevil-cafeteria-frontend
gsutil iam ch allUsers:objectViewer gs://sundevil-cafeteria-frontend
```

## 🏗️ Backend Deployment

### Option 1: Using Cloud Build (Recommended)
```bash
cd backend

# Submit build using cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_DB_PASSWORD=your-secure-database-password
```

### Option 2: Manual Build and Deploy
```bash
cd backend

# Build container image
gcloud builds submit --tag gcr.io/sundevil-cafeteria/backend .

# Deploy to Cloud Run
gcloud run deploy sundevil-cafeteria-backend \
    --image gcr.io/sundevil-cafeteria/backend:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars DB_PASSWORD=your-secure-database-password \
    --add-cloudsql-instances sundevil-cafeteria:us-central1:sundevil-cafeteria-db \
    --memory 1Gi \
    --cpu 1000m \
    --max-instances 10
```

## 🌐 Frontend Deployment

### Option 1: Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in frontend directory
cd frontend
firebase init hosting

# Configure firebase.json:
# {
#   "hosting": {
#     "public": ".",
#     "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
#     "rewrites": [{
#       "source": "**",
#       "destination": "/index.html"
#     }]
#   }
# }

# Update API_BASE_URL in js/app.js to point to your deployed backend
# const API_BASE_URL = 'https://your-backend-url/api';

# Deploy to Firebase
firebase deploy
```

### Option 2: Cloud Storage + CDN
```bash
cd frontend

# Update API endpoint in js/app.js first
# const API_BASE_URL = 'https://your-backend-url/api';

# Upload files to Cloud Storage
gsutil -m cp -r * gs://sundevil-cafeteria-frontend

# Enable website configuration
gsutil web set -m index.html -e index.html gs://sundevil-cafeteria-frontend
```

## 🖼️ Image Storage Setup

### Configure Image Storage Permissions
```bash
# Create service account for Cloud Storage access
gcloud iam service-accounts create storage-access \
    --display-name="Storage Access Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding sundevil-cafeteria \
    --member="serviceAccount:storage-access@sundevil-cafeteria.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Grant Cloud Run service access to Storage
gcloud run services add-iam-policy-binding sundevil-cafeteria-backend \
    --region=us-central1 \
    --member="serviceAccount:storage-access@sundevil-cafeteria.iam.gserviceaccount.com" \
    --role="roles/run.invoker"
```

## 🔍 Verification Commands

### Check Backend Deployment
```bash
# Get service URL
gcloud run services describe sundevil-cafeteria-backend \
    --region=us-central1 \
    --format="value(status.url)"

# Test health endpoint
curl https://your-backend-url/actuator/health

# Test menu endpoint
curl https://your-backend-url/api/menu

# View logs
gcloud run services logs read sundevil-cafeteria-backend \
    --region=us-central1 \
    --limit=50
```

### Check Database Connection
```bash
# Connect to Cloud SQL instance
gcloud sql connect sundevil-cafeteria-db --user=postgres

# Or connect with proxy
./cloud_sql_proxy -instances=sundevil-cafeteria:us-central1:sundevil-cafeteria-db=tcp:5432
```

### Check Storage Bucket
```bash
# List files in image bucket
gsutil ls gs://sundevil-cafeteria-images/

# Check bucket permissions
gsutil iam get gs://sundevil-cafeteria-images
```

## 🔄 Update Deployment

### Update Backend
```bash
cd backend

# Rebuild and redeploy
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_DB_PASSWORD=your-secure-database-password
```

### Update Frontend
```bash
cd frontend

# Update API endpoint if needed
# Edit js/app.js: const API_BASE_URL = 'https://your-backend-url/api';

# Redeploy to Firebase
firebase deploy

# Or update Cloud Storage
gsutil -m cp -r * gs://sundevil-cafeteria-frontend
```

## 🎛️ Configuration Management

### Set Environment Variables
```bash
# Update Cloud Run service with new environment variables
gcloud run services update sundevil-cafeteria-backend \
    --region=us-central1 \
    --set-env-vars="DB_PASSWORD=new-password,GCP_BUCKET_NAME=sundevil-cafeteria-images"
```

### Scale Service
```bash
# Scale Cloud Run service
gcloud run services update sundevil-cafeteria-backend \
    --region=us-central1 \
    --min-instances=1 \
    --max-instances=20
```

## 🔐 Security Commands

### Set IAM Permissions
```bash
# Allow Cloud Run to access Cloud SQL
gcloud projects add-iam-policy-binding sundevil-cafeteria \
    --member="serviceAccount:your-service-account@sundevil-cafeteria.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

# Allow Cloud Run to access Cloud Storage
gcloud projects add-iam-policy-binding sundevil-cafeteria \
    --member="serviceAccount:your-service-account@sundevil-cafeteria.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"
```

### Configure CORS (if needed)
```bash
# CORS is configured in the Spring Boot SecurityConfig
# No additional commands needed for API access

# For direct browser uploads to Storage (advanced):
# gsutil cors set cors.json gs://sundevil-cafeteria-images
```

## 📊 Monitoring Commands

### View Metrics
```bash
# Cloud Run metrics
gcloud run services describe sundevil-cafeteria-backend \
    --region=us-central1 \
    --format="export"

# SQL instance metrics
gcloud sql instances describe sundevil-cafeteria-db

# Storage usage
gsutil du -sh gs://sundevil-cafeteria-images
```

### Set up Alerts
```bash
# Create uptime check
gcloud alpha monitoring uptime create-web-check \
    --display-name="Sundevil Cafeteria Backend" \
    --hostname="your-backend-url"
```

## 🧪 Testing the Image Upload Feature

### Test Image Upload via API
```bash
# Test image upload endpoint (replace with actual menu item ID)
curl -X POST https://your-backend-url/api/menu/1/image \
  -F "image=@/path/to/test-image.jpg" \
  -H "Content-Type: multipart/form-data"
```

### Sample Menu Data
The system comes with pre-populated menu items:
- **Breakfast**: French Toast, Pancakes, Breakfast Burrito, Avocado Toast, Oatmeal Bowl, Breakfast Sandwich
- **Lunch**: Grilled Chicken Salad, Turkey Club, Veggie Wrap, Caesar Wrap, Quinoa Bowl, Fish Tacos
- **Dinner**: Grilled Salmon, Chicken Parmesan, Beef Stir Fry, Vegetarian Pasta, BBQ Ribs, Stuffed Peppers
- **Beverages**: Coffee, Iced Tea, Orange Juice, Smoothie, Hot Chocolate, Sparkling Water

## 🗑️ Cleanup Commands (Use with caution!)

### Delete Cloud Run Service
```bash
gcloud run services delete sundevil-cafeteria-backend --region=us-central1
```

### Delete Cloud SQL Instance
```bash
gcloud sql instances delete sundevil-cafeteria-db
```

### Delete Storage Buckets
```bash
gsutil rm -r gs://sundevil-cafeteria-images
gsutil rm -r gs://sundevil-cafeteria-frontend
```

### Delete Container Images
```bash
gcloud container images delete gcr.io/sundevil-cafeteria/backend --force-delete-tags
```

## 🆘 Troubleshooting Commands

### Debug Container
```bash
# Get service details
gcloud run services describe sundevil-cafeteria-backend --region=us-central1

# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=sundevil-cafeteria-backend" --limit=100

# Test database connection
gcloud sql instances describe sundevil-cafeteria-db
```

### Check Permissions
```bash
# List IAM policies
gcloud projects get-iam-policy sundevil-cafeteria

# Test service account
gcloud auth activate-service-account --key-file=gcloud-key.json
gcloud auth list
```

### Debug Image Upload Issues
```bash
# Check bucket permissions
gsutil iam get gs://sundevil-cafeteria-images

# Test file upload to bucket
echo "test" | gsutil cp - gs://sundevil-cafeteria-images/test.txt

# Check CORS configuration
gsutil cors get gs://sundevil-cafeteria-images
```

## 📝 Useful URLs After Deployment

- Backend API: `https://your-backend-url/api`
- Health Check: `https://your-backend-url/actuator/health`
- Menu API: `https://your-backend-url/api/menu`
- Frontend: `https://your-project.web.app` (Firebase) or `https://storage.googleapis.com/sundevil-cafeteria-frontend/index.html`
- Cloud Console: `https://console.cloud.google.com/run?project=sundevil-cafeteria`
- Storage Console: `https://console.cloud.google.com/storage/browser/sundevil-cafeteria-images`

## 🔧 Environment Variables Reference

### Backend Environment Variables
- `DB_PASSWORD` - Database password
- `GCP_PROJECT_ID` - Google Cloud project ID (default: sundevil-cafeteria)
- `GCP_BUCKET_NAME` - Storage bucket name (default: sundevil-cafeteria-images)
- `SPRING_PROFILES_ACTIVE` - Set to `prod` for production
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON (handled automatically in Cloud Run)

### Frontend Configuration
- Update `API_BASE_URL` in `frontend/js/app.js` to point to your deployed backend URL

## 🎮 Default Test Accounts

The system creates these accounts automatically:
- **Manager**: username: `manager`, password: `password123`
- **Worker**: username: `worker`, password: `password123`  
- **Customer**: username: `customer`, password: `password123`

---

**💡 Pro Tips:**
- Always test in a staging environment first
- Use Cloud Build triggers for automatic deployments
- Set up monitoring and alerting before going live
- Keep your service account keys secure and rotate them regularly
- Monitor storage costs as image uploads can accumulate
- Consider implementing image compression and resizing for better performance
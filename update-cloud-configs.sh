#!/bin/bash

# Step 2: Update Cloud Configurations in AEM for Localized Pages
# This script updates each localized page in AEM to use the correct Edge Delivery Services site

echo "=== Step 2: Update Cloud Configurations in AEM ==="
echo ""

# Configuration for each locale
declare -A LOCALES=(
    ["ch-de"]="ue-multitenant-root-ch-de"
    ["ch-fr"]="ue-multitenant-root-ch-fr" 
    ["ch-en"]="ue-multitenant-root-ch-en"
    ["de-en"]="ue-multitenant-root-de-en"
    ["de-de"]="ue-multitenant-root-de-de"
)

# AEM Author URL (from your previous configuration)
AEM_AUTHOR_URL="https://author-p24706-e491522.adobeaemcloud.com"

echo "Updating Cloud Configurations for each locale..."
echo ""

for locale in "${!LOCALES[@]}"; do
    site_name="${LOCALES[$locale]}"
    echo "🔧 Updating configuration for $locale -> $site_name"
    
    # Create the configuration JSON
    cat > "cloud-config-${locale}.json" << EOF
{
  "code": {
    "owner": "comwrapukreply",
    "repo": "ue-multitenant-root",
    "source": {
      "type": "github",
      "url": "https://github.com/ComwrapUkReply/ue-multitenant-root"
    }
  },
  "content": {
    "source": {
      "url": "${AEM_AUTHOR_URL}/bin/franklin.delivery/ComwrapUkReply/${site_name}/main",
      "type": "markup",
      "suffix": ".html"
    }
  },
  "access": {
    "admin": {
      "role": {
        "admin": [
          "s.sznajder@reply.com"
        ],
        "config_admin": [
          "B0AC1E69623B0F1F0A495EC0@techacct.adobe.com"
        ]
      },
      "requireAuth": "auto"
    }
  }
}
EOF

    echo "✅ Configuration file created: cloud-config-${locale}.json"
done

echo ""
echo "📋 Next steps:"
echo "1. Go to AEM Author: $AEM_AUTHOR_URL"
echo "2. Navigate to each localized page:"
echo "   - /content/ue-multitenant-root/ch/de"
echo "   - /content/ue-multitenant-root/ch/fr" 
echo "   - /content/ue-multitenant-root/ch/en"
echo "   - /content/ue-multitenant-root/de/en"
echo "   - /content/ue-multitenant-root/de/de"
echo ""
echo "3. For each page:"
echo "   - Select the page"
echo "   - Click 'Properties'"
echo "   - Go to 'Cloud Services' tab"
echo "   - Configure 'Adobe Edge Delivery Services'"
echo "   - Set the site name to the corresponding Edge Delivery Services site"
echo ""
echo "4. Or use the AEM Admin API to update configurations programmatically"
echo ""
echo "Configuration files created:"
ls -la cloud-config-*.json


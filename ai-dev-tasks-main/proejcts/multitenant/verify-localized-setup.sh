#!/bin/bash

# Step 3: Verify All Localized Sites Are Working Correctly
echo "=== Step 3: Verification ==="
echo ""

# Edge Delivery Services sites URLs
declare -a SITES=(
    "https://main--ue-multitenant-root-ch-de--comwrapukreply.aem.page"
    "https://main--ue-multitenant-root-ch-fr--comwrapukreply.aem.page"
    "https://main--ue-multitenant-root-ch-en--comwrapukreply.aem.page"
    "https://main--ue-multitenant-root-de-en--comwrapukreply.aem.page"
    "https://main--ue-multitenant-root-de-de--comwrapukreply.aem.page"
)

# AEM Author URLs for Universal Editor
declare -a AEM_PAGES=(
    "https://author-p24706-e491522.adobeaemcloud.com/content/ue-multitenant-root/ch/de.html"
    "https://author-p24706-e491522.adobeaemcloud.com/content/ue-multitenant-root/ch/fr.html"
    "https://author-p24706-e491522.adobeaemcloud.com/content/ue-multitenant-root/ch/en.html"
    "https://author-p24706-e491522.adobeaemcloud.com/content/ue-multitenant-root/de/en.html"
    "https://author-p24706-e491522.adobeaemcloud.com/content/ue-multitenant-root/de/de.html"
)

# Locale names for display
declare -a LOCALES=(
    "Switzerland German (ch-de)"
    "Switzerland French (ch-fr)"
    "Switzerland English (ch-en)"
    "Germany English (de-en)"
    "Germany German (de-de)"
)

echo "🔍 Testing Edge Delivery Services Sites..."
echo ""

# Test each Edge Delivery Services site
for i in "${!SITES[@]}"; do
    site="${SITES[$i]}"
    locale="${LOCALES[$i]}"
    
    echo "Testing $locale:"
    echo "URL: $site"
    
    # Test if site is accessible
    response=$(curl -s -o /dev/null -w "%{http_code}" "$site")
    
    if [ "$response" = "200" ]; then
        echo "✅ Status: $response - Site is accessible"
    else
        echo "❌ Status: $response - Site may not be ready yet"
    fi
    
    echo ""
done

echo "🔍 Testing AEM Author Pages..."
echo ""

# Test each AEM author page
for i in "${!AEM_PAGES[@]}"; do
    page="${AEM_PAGES[$i]}"
    locale="${LOCALES[$i]}"
    
    echo "Testing $locale AEM page:"
    echo "URL: $page"
    
    # Test if AEM page is accessible
    response=$(curl -s -o /dev/null -w "%{http_code}" "$page")
    
    if [ "$response" = "200" ]; then
        echo "✅ Status: $response - AEM page is accessible"
    else
        echo "❌ Status: $response - AEM page may not be ready yet"
    fi
    
    echo ""
done

echo "📋 Manual Verification Checklist:"
echo ""
echo "✅ Edge Delivery Services Sites:"
for i in "${!SITES[@]}"; do
    echo "   • ${LOCALES[$i]}: ${SITES[$i]}"
done

echo ""
echo "✅ AEM Universal Editor Pages:"
for i in "${!AEM_PAGES[@]}"; do
    echo "   • ${LOCALES[$i]}: ${AEM_PAGES[$i]}"
done

echo ""
echo "🔧 Additional Verification Steps:"
echo "1. Open each Edge Delivery Services site in a browser"
echo "2. Verify content renders correctly"
echo "3. Test Universal Editor on each AEM page:"
echo "   - Add ?editor=on to the URL"
echo "   - Verify editing interface loads"
echo "   - Test adding/editing content"
echo "   - Verify changes are published to Edge Delivery Services"
echo ""
echo "4. Check Cloud Configurations in AEM:"
echo "   - Go to each localized page"
echo "   - Check Properties > Cloud Services"
echo "   - Verify Edge Delivery Services configuration"
echo ""
echo "5. Test RepoLess functionality:"
echo "   - Make changes in Universal Editor"
echo "   - Verify changes appear on Edge Delivery Services site"
echo "   - Test different locales independently"

echo ""
echo "🎯 Expected Results:"
echo "• All 5 Edge Delivery Services sites should be accessible"
echo "• All 5 AEM pages should load in Universal Editor"
echo "• Content changes in AEM should publish to Edge Delivery Services"
echo "• Each locale should work independently"
echo "• Universal Editor should work for all locales"


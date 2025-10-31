#!/bin/bash

# Step 2: Create Cloud Configuration Files for AEM Localized Pages
echo "=== Step 2: Create Cloud Configuration Files ==="
echo ""

# AEM Author URL
AEM_AUTHOR_URL="https://author-p24706-e491522.adobeaemcloud.com"

# Create configuration for each locale
echo "🔧 Creating configuration files for each locale..."

# Switzerland German (ch-de)
cat > "cloud-config-ch-de.json" << EOF
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
      "url": "${AEM_AUTHOR_URL}/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root-ch-de/main",
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

# Switzerland French (ch-fr)
cat > "cloud-config-ch-fr.json" << EOF
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
      "url": "${AEM_AUTHOR_URL}/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root-ch-fr/main",
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

# Switzerland English (ch-en)
cat > "cloud-config-ch-en.json" << EOF
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
      "url": "${AEM_AUTHOR_URL}/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root-ch-en/main",
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

# Germany English (de-en)
cat > "cloud-config-de-en.json" << EOF
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
      "url": "${AEM_AUTHOR_URL}/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root-de-en/main",
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

# Germany German (de-de)
cat > "cloud-config-de-de.json" << EOF
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
      "url": "${AEM_AUTHOR_URL}/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root-de-de/main",
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

echo "✅ All configuration files created!"
echo ""
echo "📁 Configuration files:"
ls -la cloud-config-*.json
echo ""
echo "📋 Next: Update Cloud Configurations in AEM"
echo "1. Go to AEM Author: $AEM_AUTHOR_URL"
echo "2. Navigate to each localized page and update Cloud Services"
echo "3. Or use AEM Admin API to update programmatically"


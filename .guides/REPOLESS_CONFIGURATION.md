# RepoLess Configuration Guide

This document provides instructions for setting up and managing the RepoLess configuration for the `ue-multitenant-root` project.

## Overview

RepoLess allows multiple AEM sites to share the same codebase while maintaining separate content sources. This eliminates the need for code replication across multiple repositories.

## Prerequisites

- [x] AEM as a Cloud Service 2025.4 or later
- [x] AEM configuration service activated
- [x] Configuration page created in AEM at `/content/ue-multitenant-root/configuration`
- [x] AEM Edge Delivery Services Configuration set to "aem.live with repoless config setup"
- [x] Technical account configured: `B0AC1E69623B0F1F0A495EC0@techacct.adobe.com`

## Configuration Details

| Parameter | Value |
|-----------|-------|
| GitHub Organization | ComwrapUkReply |
| Repository | ue-multitenant-root |
| Site Name | ue-multitenant-root |
| AEM Author URL | https://author-p24706-e491522.adobeaemcloud.com |
| Admin Email | s.sznajder@reply.com |

## Setup Scripts

### 1. Initial Setup

Run the complete RepoLess configuration:

`bash
./scripts/setup-repoless.sh
`

This script will:
1. Configure content and code sources
2. Set up path mappings
3. Configure technical account access
4. Verify the configuration

### 2. Verification

Check the current configuration status:

`bash
./scripts/verify-repoless.sh
`

This script verifies:
- Configuration endpoints
- Site accessibility
- Component definitions
- Path mappings

## Manual Configuration Steps

If you need to configure manually, follow these steps:

### Step 1: Configure Content and Code Sources

`bash
curl -X PUT https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root.json \
  -H 'content-type: application/json' \
  -H 'x-auth-token: <your-token>' \
  --data '{
  "version": 1,
  "code": {
    "owner": "ComwrapUkReply",
    "repo": "ue-multitenant-root",
    "source": {
      "type": "github",
      "url": "https://github.com/ComwrapUkReply/ue-multitenant-root"
    }
  },
  "content": {
    "source": {
      "url": "https://author-p24706-e491522.adobeaemcloud.com/bin/franklin.delivery/ComwrapUkReply/ue-multitenant-root/main",
      "type": "markup",
      "suffix": ".html"
    }
  }
}'
`

### Step 2: Add Path Mapping

`bash
curl --request POST \
  --url https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/public.json \
  --header 'x-auth-token: <your-token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "paths": {
        "mappings": [
            "/content/ue-multitenant-root/:/",
            "/content/ue-multitenant-root/configuration:/.helix/config.json"
        ],
        "includes": [
            "/content/ue-multitenant-root/",
            "/content/dam/ue-multitenant-root/"
        ]
    }
}'
`

### Step 3: Configure Access Control

`bash
curl --request POST \
  --url https://admin.hlx.page/config/ComwrapUkReply/sites/ue-multitenant-root/access.json \
  --header 'Content-Type: application/json' \
  --header 'x-auth-token: <your-token>' \
  --data '{
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
}'
`

## Important URLs

| URL Type | Link |
|----------|------|
| Live Site | https://main--ue-multitenant-root--ComwrapUkReply.aem.live/ |
| Preview Site | https://main--ue-multitenant-root--ComwrapUkReply.aem.page/ |
| Config Endpoint | https://main--ue-multitenant-root--ComwrapUkReply.aem.live/config.json |
| Component Definitions | https://main--ue-multitenant-root--ComwrapUkReply.aem.live/component-definition.json |

## Current Status

✅ **Working:**
- Site is accessible and serving content
- Component definitions are loading
- Preview and live sites are functional

⚠️ **Pending:**
- RepoLess configuration endpoints (config.json) - may take 5-10 minutes to propagate
- Path mapping verification

## Next Steps

1. **Wait for Propagation**: Configuration changes typically take 5-10 minutes to propagate
2. **Remove Legacy Files**: Once configuration is verified, remove:
   - `fstab.yaml`
   - `paths.json`
3. **Test Publishing**: Publish content from AEM and verify it appears on the live site
4. **Create Additional Sites**: Use this configuration as a base for additional RepoLess sites

## Troubleshooting

### Configuration Not Loading

If `config.json` is not accessible after 10 minutes:

1. **Check Auth Token**: Ensure the auth token hasn't expired
2. **Verify AEM Settings**: 
   - Configuration page exists at `/content/ue-multitenant-root/configuration`
   - Edge Delivery Services Configuration is set to "aem.live with repoless config setup"
3. **Check Technical Account**: Verify the technical account has proper permissions
4. **Review AEM Logs**: Check `error.log` for any exceptions

### Common Issues

| Issue | Solution |
|-------|----------|
| 404 on config.json | Wait for propagation or re-run setup script |
| White page in Universal Editor | Check AEM error logs and verify configuration |
| Publishing not working | Verify technical account permissions |
| Components not loading | Check component-definition.json is accessible |

## Creating Additional RepoLess Sites

Once this base configuration is working, you can create additional sites that share the same codebase:

1. Create a new content structure in AEM
2. Configure the new site using the same GitHub repository
3. Set up unique path mappings for the new site
4. Use the same technical account for publishing

## References

- [AEM RepoLess Documentation](https://www.aem.live/developer/repoless-authoring)
- [Multi-site Management](https://www.aem.live/developer/repoless-multi-site-management)
- [Path Mapping Guide](https://www.aem.live/developer/path-mapping)

## Support

For issues or questions:
- Contact: s.sznajder@reply.com
- Technical Account: B0AC1E69623B0F1F0A495EC0@techacct.adobe.com
- GitHub: https://github.com/ComwrapUkReply/ue-multitenant-root

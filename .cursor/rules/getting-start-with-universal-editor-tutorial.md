# Getting Started – Universal Editor Developer Tutorial

This tutorial will get you up-and-running with a new Adobe Experience Manager (AEM) project, authored in Universal Editor and publishing to Edge Delivery. In about thirty minutes, you will have created your own site and be able to create, preview, and publish your own content, styling, and add new blocks.

## Prerequisites

* You have a GitHub account, and understand Git basics.
* You have access to an AEM as a Cloud Service sandbox environment.
* You understand the basics of HTML, CSS, and JavaScript.
* You have Node/npm installed for local development.

This tutorial uses macOS, Chrome, and Visual Studio Code as the development environment and the screenshots and instructions reflect that setup. You can use a different operating system, browser, and code editor, but the UI you see and steps you must take may vary accordingly.

**This tutorial uses AEM authoring as the content source.** **But you can choose from other content sources depending on your project's needs.**

**If you are looking for a headless solution using the Universal Editor,** **check out the SecurBank sample app.**

## Use the project boilerplate to create your code repository

The fastest and easiest way to get started following AEM best practices is to create your repository using the Boilerplate GitHub repository as a template.

This tutorial uses the standard AEM project boilerplate, which is the best solution for many projects. However you can also use the Commerce project boilerplate, if your AEM Authoring with Edge Delivery Services project needs to integrate with Adobe Commerce. The steps remain the same.

### Step 1: Create Repository from Template

1. Navigate to the GitHub page of the boilerplate appropriate for your project.  
   * For most projects: `https://github.com/adobe-rnd/aem-boilerplate-xwalk`  
   * For projects that integrate with Adobe Commerce: `https://github.com/adobe-rnd/aem-boilerplate-xcom`
2. Click on **Use this template** and select **Create a new repository**.  
   * You will need to be signed in to GitHub to see this option.

3. By default, the repository will be assigned to you. Adobe recommends leaving the repository set to **Public**. Provide a repository name and description and click **Create repository**.

### Step 2: Configure AEM Code Sync

1. In a new tab in the same browser, navigate to `https://github.com/apps/aem-code-sync` and click **Configure**.

2. Click **Configure** for the org where you created your new repository in the previous step.

3. On the AEM Code Sync GitHub page under **Repository access**, select **Only select repositories**, select the repository that you created in the previous step, and then click **Save**.

4. Once AEM Code Sync is installed, you receive a confirmation screen. Return to the browser tab of your new repository.

You now have your own GitHub repository for developing your own Edge Delivery Services project, based on Adobe's best-practices boilerplate.

## Connect your code to your content

Now that you have your GitHub project, you need to link the repository to your AEM authoring instance.

### Step 3: Configure fstab.yaml

1. In your new GitHub project, click the `fstab.yaml` file to open it and then the **Edit this file** icon to edit it.
2. Edit the `fstab.yaml` file to update the mount point of your project. Replace the default Google Docs URL with the URL of your AEM as a Cloud Service authoring instance and then click **Commit changes…**.

* `https://<aem-author>/bin/franklin.delivery/<owner>/<repository>/main`
* Changing the mount point tells Edge Delivery Services where to find the content of the site.

3. Add a commit message as desired and then click **Commit changes**, committing them directly to the `main` branch.

### Step 4: Configure paths.json

1. Return to the root of your repository and click on `paths.json` and then the **Edit this file** icon.

2. The default mapping will use the name of the repository. Update the default mappings as required for your project, for example `/content/<site-name>/:/` and similar, and click **Commit changes…**.
* Provide your own `<site-name>`. You will need it in a later step.
* The mappings tell Edge Delivery Services how to map the content in your AEM repository to the site URL.

3. Add a commit message as desired and then click **Commit changes**, committing them directly to the `main` branch.

## Create and publish your site

With your GitHub project set up and linked to your AEM instance, you are ready to create and publish a new AEM site using Edge Delivery Services.

### Step 5: Create an AEM Site

1. Download the latest AEM authoring with Edge Delivery Services site template from GitHub appropriate to your project.  
   * For most projects: `https://github.com/adobe-rnd/aem-boilerplate-xwalk/releases`  
   * For projects that integrate with Adobe Commerce: `https://github.com/adobe-rnd/aem-boilerplate-xcom/releases`

2. Sign in to your AEM as a Cloud Service authoring instance and navigate to the **Sites** console and click **Create** → **Site from template**.

3. On the **Select a site template** tab of the create site wizard, click the **Import** button to import a new template.

4. Upload the AEM authoring with Edge Delivery Services site template that you downloaded from GitHub.  
   * The template must only be uploaded once. Once uploaded it can be reused to create additional sites.

5. Once the template is imported, it appears in the wizard. Click to select it and then click **Next**.

6. Provide the following fields and tap or click **Create**.
* **Site title** - Add a descriptive title for the site.
* **Site name** - Use the `<site-name>` that you defined in the previous step.
* **GitHub URL** - Use the URL of the GitHub project you created in the previous step.

7. AEM confirms the site creation with a dialog. Click **OK** to dismiss.

8. On the sites console, navigate to the index.html of the newly-created site and click **Edit** in the toolbar.

9. The Universal Editor opens in a new tab. You may need to tap or click **Sign in with Adobe** to authenticate to edit your page.

You can now edit your site using the Universal Editor.

### Step 6: Publishing Your New Site to Edge Delivery Services

Once you are finished editing your new site using the Universal Editor, you can publish your content.

1. On the sites console, select all of the pages you created for your new site and tap or click **Quick publish** in the toolbar.

2. Tap or click **Publish** in the confirmation dialog to start the process.

3. Open a new tab in the same browser and navigate to the URL of your new site.  
   * `https://main--<repository-name>--<owner>.aem.page`

4. See your content published.

Now that you have a working Edge Delivery Services project with AEM authoring, you can begin customizing it by creating and styling your own blocks.

## Start developing styling and functionality

To get started with development, it is easiest to install the AEM Command Line Interface (CLI) and clone your repo locally through using the following.

```bash
npm install -g @adobe/aem-cli
git clone https://github.com/<owner>/<repo>
```

From there change into your project folder and start your local development environment using the following.

```bash
cd <repo>
aem up
```

This opens `http://localhost:3000/` and you are ready to make changes.  
A good place to start is in the `blocks` folder which is where most of the styling and code lives for a project. Simply make a change in a `.css` or `.js` and you should see the changes in your browser immediately.

Once you are ready to push your changes, simply use Git to add, commit, and push and your code to your preview (`https://<branch>--<repo>--<owner>.aem.page/`) and production (`https://<branch>--<repo>--<owner>.aem.live/`) sites.

**That's it, you made it! Congrats, your first site is up and running. If you need help in the tutorial, please** **join our Discord channel** **or** **get in touch with us.**

## Key Configuration Files for AI Agent Setup

When setting up a Universal Editor project, an AI agent should focus on these critical configuration files:

### fstab.yaml
```yaml
mountpoints:
  - mount: /
    url: https://<aem-author>/bin/franklin.delivery/<owner>/<repository>/main
```

### paths.json
```json
{
  "mappings": [
    "/content/<site-name>/:/",
    "/content/<site-name>/configuration:/.helix/config.json"
  ],
  "includes": [
    "/content/<site-name>/"
  ]
}
```

### Repository Structure
The AI agent should ensure the repository contains:
- `fstab.yaml` - Content source configuration
- `paths.json` - URL mapping configuration
- `component-definitions.json` - Component registry
- `component-models.json` - Content models
- `component-filters.json` - Component filters
- `blocks/` directory - Custom blocks
- `styles/` directory - Global styles
- `scripts/` directory - JavaScript functionality

### Required GitHub Apps
- AEM Code Sync (`https://github.com/apps/aem-code-sync`)

### Template Repositories
- Standard: `https://github.com/adobe-rnd/aem-boilerplate-xwalk`
- Commerce: `https://github.com/adobe-rnd/aem-boilerplate-xcom`

### Development Commands
```bash
# Install AEM CLI
npm install -g @adobe/aem-cli

# Clone repository
git clone https://github.com/<owner>/<repo>

# Start local development
cd <repo>
aem up
```

### URL Patterns
- Preview: `https://<branch>--<repo>--<owner>.aem.page/`
- Production: `https://<branch>--<repo>--<owner>.aem.live/`

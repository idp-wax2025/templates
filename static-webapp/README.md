# Azure Static Web Apps Template

This template deploys a static website using Azure Static Web Apps, which is different from the blob storage approach used in the `static-website` template.

## Azure Static Web Apps vs. Azure Blob Storage

**Azure Static Web Apps** provides:
- Global CDN with automatic SSL certificates
- Integrated CI/CD from GitHub, Azure DevOps, or GitLab
- Built-in authentication and authorization
- Serverless API support (Azure Functions)
- Staging environments for pull requests
- Custom domains with automatic SSL
- Zero configuration required for SPA routing

**Azure Blob Storage** (static-website template) provides:
- Simple static hosting
- Manual CDN configuration
- Lower cost for basic scenarios
- More control over CDN settings

## Configuration

The template accepts the following configuration parameters:

- `path`: Path to the website files (default: `./www`)
- `repositoryUrl`: GitHub repository URL for CI/CD integration (optional)
- `branch`: Repository branch to deploy from (default: `main`)

## Deployment

1. Set up your Pulumi stack:
   ```bash
   pulumi new . --name my-static-webapp
   ```

2. Configure the stack (optional):
   ```bash
   pulumi config set path ./www
   pulumi config set repositoryUrl https://github.com/your-username/your-repo
   pulumi config set branch main
   ```

3. Deploy:
   ```bash
   pulumi up
   ```

## CI/CD Integration

If you provide a `repositoryUrl`, the static web app will be configured for automatic deployment from your repository. You'll need to:

1. Add the repository token to your GitHub repository secrets
2. Create a GitHub Actions workflow file (`.github/workflows/azure-static-web-apps.yml`)

## Custom Configuration

The `staticwebapp.config.json` file in the `www` folder allows you to configure:
- Routing rules
- Authentication requirements
- Response overrides
- Global headers
- MIME types

For more information, see the [Azure Static Web Apps configuration documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/configuration).

## Outputs

After deployment, you'll get:
- `staticWebAppUrl`: The URL of your deployed static web app
- `staticWebAppName`: The name of the static web app resource
- `resourceGroupName`: The name of the resource group
- `repositoryToken`: The deployment token for CI/CD (if repository is configured)

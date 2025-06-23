import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Import the program's configuration settings.
const config = new pulumi.Config();
const path = config.get("path") || "./www";

// Create a resource group for the static web app.
const resourceGroup = new azure.resources.ResourceGroup("resource-group", {});

// Create the Azure Static Web App
const staticWebApp = new azure.web.StaticSite("static-web-app", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Free",
        tier: "Free",
    },
    // Enable staging environments
    stagingEnvironmentPolicy: "Enabled",
    // Allow form processing
    allowConfigFileUpdates: true,
});

// Create a custom domain (optional) - requires domain verification
// Uncomment and configure if you have a custom domain
/*
const customDomain = new azure.web.StaticSiteCustomDomain("custom-domain", {
    name: staticWebApp.name,
    resourceGroupName: resourceGroup.name,
    domainName: "your-domain.com", // Replace with your domain
});
*/

// Export the URLs and information about the static web app.
export const staticWebAppUrl = pulumi.interpolate`https://${staticWebApp.defaultHostname}`;
export const staticWebAppName = staticWebApp.name;
export const resourceGroupName = resourceGroup.name;

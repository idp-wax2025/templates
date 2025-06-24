import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { storage } from "@pulumi/azure-native";
import { AppServicePlan, WebApp } from "@pulumi/azure-native/web";
import { RoleAssignment } from "@pulumi/azure-native/authorization";
import { azureBuiltInRoles } from "./azureBuiltInRoles";

// Get configuration values
const config = new pulumi.Config();
const maximumInstanceCount = config.getNumber("maximumInstanceCount") || 100;
const instanceMemoryMB = config.getNumber("instanceMemoryMB") || 2048;

// Create resource group
const resourceGroup = new azure.resources.ResourceGroup("rg-functionapp");

const storageAccount = new azure.storage.StorageAccount("stfunctionapp", {
  resourceGroupName: resourceGroup.name,
  allowBlobPublicAccess: false,
  kind: azure.storage.Kind.StorageV2,
  sku: {
    name: azure.storage.SkuName.Standard_LRS,
  },
});

const blobContainer = new storage.BlobContainer('deploymentPackageContainer', {
  resourceGroupName: resourceGroup.name,
  accountName: storageAccount.name,
  containerName: 'deploymentpackage',
});

const servicePlan = new AppServicePlan("functionapp-plan", {
  resourceGroupName: resourceGroup.name,
  sku: {
    tier: 'FlexConsumption',
    name: 'FC1'
  },
  reserved: true
});

// Prepare app settings
const defaultAppSettings = [
  {
    name: 'AzureWebJobsStorage__accountName',
    value: storageAccount.name
  }
];

const functionApp = new WebApp("functionapp", {
  resourceGroupName: resourceGroup.name,
  kind: 'functionapp,linux',
  serverFarmId: servicePlan.id,
  identity: {
    type: 'SystemAssigned'
  },
  siteConfig: {
    appSettings: defaultAppSettings
  },  
  functionAppConfig: {
    deployment: {
      storage: {
        type: 'blobContainer',
        value: pulumi.interpolate`${storageAccount.primaryEndpoints.blob}${blobContainer.name}`,
        authentication: {
          type: 'SystemAssignedIdentity'
        }
      }
    },
    scaleAndConcurrency: {
      instanceMemoryMB: instanceMemoryMB,
      maximumInstanceCount: maximumInstanceCount,
    },
    runtime: {
      name: "dotnet-isolated",
      version: "9.0"
    }
  }
});

const roleAssignment = new RoleAssignment('storageBlobDataContributor', {
  roleDefinitionId: azureBuiltInRoles.storageBlobDataContributor,
  scope: storageAccount.id,
  principalId: functionApp.identity.apply((p: any) => p!.principalId),
  principalType: 'ServicePrincipal'
});

// Export outputs
export const storageAccountName = storageAccount.name;
export const functionAppName = functionApp.name;
export const servicePlanName = servicePlan.name;
export const functionAppUrl = functionApp.hostNames;
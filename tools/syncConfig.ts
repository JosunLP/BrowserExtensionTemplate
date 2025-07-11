import * as fs from 'fs';

interface AppConfig {
  AppData: {
    id: string;
    name: string;
    version: string;
    description: string;
    repository: {
      type: string;
      url: string;
    };
    license: string;
    homepage: string;
    bugs: {
      url: string;
    };
    authors: Array<{
      name: string;
      email: string;
    }>;
  };
  htmlTemplatePairs: Array<{
    key: string;
    value: string;
  }>;
}

interface PackageJson {
  version: string;
  name: string;
  authors: Array<{
    name: string;
    email: string;
  }>;
  description: string;
  homepage: string;
  license: string;
  repository: {
    type: string;
    url: string;
  };
  bugs: {
    url: string;
  };
  [key: string]: unknown;
}

interface ManifestJson {
  version: string;
  name: string;
  description: string;
  homepage_url: string;
  [key: string]: unknown;
}

class ConfigSyncer {
  private readonly appConfigPath = './app.config.json';
  private readonly packageJsonPath = './package.json';
  private readonly manifestJsonPath = './public/manifest.json';

  public async sync(): Promise<void> {
    try {
      console.log('Starting configuration synchronization...');

      const appConfig = await this.loadAppConfig();
      const packageJson = await this.loadPackageJson();
      const manifestJson = await this.loadManifestJson();

      this.updatePackageJson(packageJson, appConfig.AppData);
      this.updateManifestJson(manifestJson, appConfig.AppData);

      await this.savePackageJson(packageJson);
      await this.saveManifestJson(manifestJson);

      console.log('Configuration synchronization completed successfully!');
    } catch (error) {
      console.error('Failed to sync configuration:', error);
      process.exit(1);
    }
  }

  private async loadAppConfig(): Promise<AppConfig> {
    try {
      const content = await fs.promises.readFile(this.appConfigPath, 'utf8');
      return JSON.parse(content) as AppConfig;
    } catch (error) {
      throw new Error(`Failed to load app config: ${error}`);
    }
  }

  private async loadPackageJson(): Promise<PackageJson> {
    try {
      const content = await fs.promises.readFile(this.packageJsonPath, 'utf8');
      return JSON.parse(content) as PackageJson;
    } catch (error) {
      throw new Error(`Failed to load package.json: ${error}`);
    }
  }

  private async loadManifestJson(): Promise<ManifestJson> {
    try {
      const content = await fs.promises.readFile(this.manifestJsonPath, 'utf8');
      return JSON.parse(content) as ManifestJson;
    } catch (error) {
      throw new Error(`Failed to load manifest.json: ${error}`);
    }
  }

  private updatePackageJson(packageJson: PackageJson, appData: AppConfig['AppData']): void {
    packageJson.version = appData.version;
    packageJson.name = appData.id;
    packageJson.authors = appData.authors;
    packageJson.description = appData.description;
    packageJson.homepage = appData.homepage;
    packageJson.license = appData.license;
    packageJson.repository = appData.repository;
    packageJson.bugs = appData.bugs;
  }

  private updateManifestJson(manifestJson: ManifestJson, appData: AppConfig['AppData']): void {
    manifestJson.version = appData.version;
    manifestJson.name = appData.name;
    manifestJson.description = appData.description;
    manifestJson.homepage_url = appData.homepage;
  }

  private async savePackageJson(packageJson: PackageJson): Promise<void> {
    try {
      const content = JSON.stringify(packageJson, null, 2);
      await fs.promises.writeFile(this.packageJsonPath, content, 'utf8');
      console.log('✓ package.json updated');
    } catch (error) {
      throw new Error(`Failed to save package.json: ${error}`);
    }
  }

  private async saveManifestJson(manifestJson: ManifestJson): Promise<void> {
    try {
      const content = JSON.stringify(manifestJson, null, 2);
      await fs.promises.writeFile(this.manifestJsonPath, content, 'utf8');
      console.log('✓ manifest.json updated');
    } catch (error) {
      throw new Error(`Failed to save manifest.json: ${error}`);
    }
  }
}

// Run the sync process
const syncer = new ConfigSyncer();
syncer.sync().catch(console.error);


import { ASSET_PATHS, getAssetUrl } from '../constants';

export class StorageService {
  /**
   * Routes and simulates uploading an asset to the jerseyswap bucket.
   * @param base64Data The source data
   * @param folderKey The folder key from ASSET_PATHS
   * @param fileName The desired filename
   * @returns The formatted public GCS URL
   */
  async uploadAsset(base64Data: string, folderKey: keyof typeof ASSET_PATHS, fileName: string): Promise<string> {
    const cleanFileName = fileName.replace(/\s+/g, '_').toLowerCase();
    
    // Use the helper to generate the URL
    const publicUrl = getAssetUrl(folderKey, cleanFileName);
    
    console.debug(`[Storage] Routing asset to: ${folderKey}/${cleanFileName}`);
    console.debug(`[Storage] Final Public URL: ${publicUrl}`);
    
    // Simulated network latency for bucket storage operation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return publicUrl;
  }
}

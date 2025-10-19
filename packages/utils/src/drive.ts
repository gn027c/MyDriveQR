import { google, Auth } from 'googleapis';
import { Readable } from 'stream';

type OAuth2Client = Auth.OAuth2Client;

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  shareableLink: string;
  thumbnailLink?: string;
}

export class GoogleDriveService {
  private drive;

  constructor(auth: OAuth2Client) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Upload a file to Google Drive
   * @param fileBuffer - File buffer to upload
   * @param fileName - Name of the file
   * @param mimeType - MIME type of the file
   * @param folderId - Optional folder ID (uses root if not specified)
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string
  ): Promise<DriveUploadResult> {
    try {
      const fileMetadata: any = {
        name: fileName,
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      // Create a readable stream from the buffer
      const stream = Readable.from(fileBuffer);

      // Upload the file
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType,
          body: stream,
        },
        fields: 'id, name, webViewLink, thumbnailLink',
      });

      if (!response.data.id) {
        throw new Error('Failed to upload file to Drive');
      }

      // Make the file publicly accessible
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Generate direct download link
      const shareableLink = `https://drive.google.com/file/d/${response.data.id}/view?usp=sharing`;

      return {
        fileId: response.data.id,
        fileName: response.data.name || fileName,
        shareableLink,
        thumbnailLink: response.data.thumbnailLink || undefined,
      };
    } catch (error) {
      console.error('Error uploading to Drive:', error);
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a file from Google Drive
   * @param fileId - ID of the file to delete
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
      });
    } catch (error) {
      console.error('Error deleting file from Drive:', error);
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List files in a specific folder
   * @param folderId - Optional folder ID
   * @param pageSize - Number of files to retrieve
   */
  async listFiles(folderId?: string, pageSize: number = 100) {
    try {
      const query = folderId ? `'${folderId}' in parents` : undefined;

      const response = await this.drive.files.list({
        pageSize,
        q: query,
        fields: 'files(id, name, mimeType, createdTime, webViewLink)',
        orderBy: 'createdTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
